import Link from "next/link";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { supabase } from "@/lib/supabaseClient";
import { setCredentials } from "@/redux/slices/authSlice";
import { detectUserRole } from "@/utils/roleDetection";

const LoginForm = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const dispatch = useDispatch();



  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const initialValues = {
    email: "",
    password: "",
  };

  const validationSchema = Yup.object({
    email: Yup.string()
      .email(t("loginForm.validation.invalidEmail"))
      .required(t("loginForm.validation.required")),
    password: Yup.string()
      .min(6, t("loginForm.validation.passwordMin"))
      .required(t("loginForm.validation.required")),
  });

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        toast.error(t("loginForm.errors.network"));
        setLoading(false);
        return;
      }

      const mapErrorKey = (message) => {
        const msg = (message || "").toLowerCase();
        if (msg.includes("invalid login") || msg.includes("invalid credentials")) {
          return "loginForm.errors.invalidCredentials";
        }
        if (msg.includes("email not confirmed") || msg.includes("confirm your email") || msg.includes("email_confirmation")) {
          return "loginForm.errors.emailNotConfirmed";
        }
        if (msg.includes("unauthorized") || msg.includes("forbidden")) {
          return "loginForm.errors.unauthorized";
        }
        if (msg.includes("network")) {
          return "loginForm.errors.network";
        }
        if (msg.includes("timeout")) {
          return "loginForm.errors.timeout";
        }
        return "loginForm.errors.unknownError";
      };

      const attempt = async () => {
        return await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });
      };

      let data, error;
      for (let i = 0; i < 3; i++) {
        const res = await attempt();
        data = res.data;
        error = res.error;
        if (!error) break;
        const msg = (error?.message || "").toLowerCase();
        const isTransient =
          msg.includes("failed to fetch") ||
          msg.includes("network") ||
          msg.includes("timeout");
        if (!isTransient) break;
        await new Promise((r) => setTimeout(r, 500 * (i + 1)));
      }

      if (error) {
        const key = mapErrorKey(error.message);
        if (key === "loginForm.errors.emailNotConfirmed") {
          toast.error(t(key), { duration: 6000 });
        } else {
          toast.error(t(key));
        }
        setLoading(false);
        return;
      }

      const session = data?.session;
      const user = data?.user;

      if (!session || !user) {
        toast.error(t("loginForm.errors.unknownError"));
        setLoading(false);
        return;
      }

      // Ensure session is set correctly
      const {
        data: { session: verifiedSession },
      } = await supabase.auth.getSession();

      if (
        !verifiedSession ||
        verifiedSession.access_token !== session.access_token
      ) {
        const { error: setSessionError } = await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        });

        if (setSessionError) {
          toast.error(t("loginForm.errors.sessionError"));
          setLoading(false);
          return;
        }
      }

      // Short delay to ensure session is ready
      await new Promise((resolve) => setTimeout(resolve, 50));

      // 🔒 تحقق من الحظر العام للمستخدم
      const { data: userData, error: userFetchError } = await supabase
        .from("users")
        .select("is_blocked")
        .eq("id", user.id)
        .maybeSingle();

      if (userFetchError) {
        console.error("Error fetching user data:", userFetchError);
      }

      if (userData?.is_blocked) {
        await supabase.auth.signOut();
        toast.error(t("loginForm.errors.accountBlocked"), { duration: 6000 });
        setLoading(false);
        return;
      }

      // Detect role
      const userRolePromise = detectUserRole(user, session);
      const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), 5000));

      const userRole = await Promise.race([userRolePromise, timeoutPromise]);

      if (!userRole) {
        toast.error(t("loginForm.errors.roleNotFound"), { duration: 5000 });
        setLoading(false);
        return;
      }

      // Sync session cookies on server
      try {
        const sessionRes = await fetch("/api/auth/set-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          }),
        });
        if (!sessionRes.ok) {
          console.error("Failed to set session on server:", await sessionRes.text());
        }
      } catch (e) {
        console.error("Error calling set-session:", e);
      }

      dispatch(
        setCredentials({
          token: session.access_token,
          refreshToken: session.refresh_token || null,
          role: userRole,
          userId: user.id,
        })
      );

      // Short delay for Redux state update
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Persist role into auth metadata for server-side checks
      try {
        const { error: updateMetaError } = await supabase.auth.updateUser({
          data: { role: userRole },
        });
        if (updateMetaError) {
          console.warn("Failed to update user metadata role:", updateMetaError.message);
        }
      } catch (e) {
        console.warn("Error updating user metadata role:", e?.message || e);
      }

      // Redirect based on role
      const normalizedRole = userRole.toLowerCase();

      if (normalizedRole === "admin") {
        router.replace("/admin");
      } else if (normalizedRole === "provider") {
        // 🔒 تحقق من حالة مزود الخدمة (يجب أن يكون مقبولاً من الأدمن)
        const { data: providerData, error: providerError } = await supabase
          .from("providers")
          .select("profile_status_id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (providerError || !providerData || providerData.profile_status_id !== 201) {
          await supabase.auth.signOut();
          toast.error(t("loginForm.errors.providerPending"), { duration: 6000 });
          setLoading(false);
          return;
        }
        router.replace("/home");
      } else if (normalizedRole === "requester") {
        router.replace("/home");
      } else {
        toast.warning(t("loginForm.errors.unknownRole"));
        router.replace("/home");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error(t("loginForm.errors.unknownError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="w-full max-w-md mx-auto rounded-[40px] bg-white text-black pt-5 pb-10 px-4 sm:px-6 md:px-8"
      style={{ boxShadow: "0px 4px 35px 0px rgba(0, 0, 0, 0.08)" }}
    >
      <div className="headForm flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
        <h2 className="text-xl font-normal text-black text-center sm:text-start">
          {t("loginForm.welcome")}{" "}
          <span className="text-primary font-medium">
            {t("loginForm.brand")}
          </span>
        </h2>
        <div className="create text-center sm:text-end">
          <h3 className="text-[#8D8D8D] text-[10px] uppercase tracking-wider mb-1">
            {t("loginForm.noAccount")}
          </h3>
          <div className="flex flex-col gap-1.5 items-center sm:items-end">
            <Link
              className="text-xs text-primary font-bold hover:underline py-1.5 px-3 rounded-lg hover:bg-primary/5 transition-all duration-200 border border-transparent hover:border-primary/20"
              href={"/signup"}
            >
              {t("loginForm.createAccount")}
            </Link>
            <Link
              className="text-[11px] text-gray-800 font-bold hover:underline py-1.5 px-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all duration-200 border border-gray-200 flex items-center gap-1.5 shadow-sm"
              href={"/signup-provider"}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {t("footer.joinAsProvider")}
            </Link>
          </div>
        </div>
      </div>

      <h4 className="text-3xl sm:text-4xl md:text-5xl font-medium mt-6 text-center sm:text-start">
        {t("loginForm.loginTitle")}
      </h4>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ touched, errors }) => (
          <Form className="mt-9 flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <label htmlFor="email">
                {t("loginForm.email")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <Field
                name="email"
                type="email"
                placeholder={t("loginForm.email")}
                className={`w-full rounded-lg border py-3 px-5 placeholder:text-sm placeholder:text-[#808080] placeholder:font-light outline-none ${touched.email && errors.email
                  ? "border-red-500"
                  : "border-[#ADADAD] focus:border-[#4285F4]"
                  }`}
              />
              <ErrorMessage
                name="email"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>

            <div className="flex flex-col gap-4">
              <label htmlFor="password">
                {t("loginForm.password")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Field
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("loginForm.password")}
                  className={`w-full rounded-lg border py-3 px-5 placeholder:text-sm placeholder:text-[#808080] placeholder:font-light outline-none pr-12 ${touched.password && errors.password
                    ? "border-red-500"
                    : "border-[#ADADAD] focus:border-[#4285F4]"
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute top-1/2 -translate-y-1/2 right-4 text-gray-500 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <ErrorMessage
                name="password"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 h-16 rounded-2xl text-white font-black text-base flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02] shadow-xl hover:shadow-blue-500/50"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{t("loginForm.loggingIn")}</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  {t("loginForm.loginButton")}
                </>
              )}
            </button>
          </Form>
        )}
      </Formik>
      {/* Resend activation helper */}
      <div className="mt-4 text-center text-sm text-gray-600">
        <button
          type="button"
          onClick={async () => {
            try {
              const emailInput = document.querySelector('input[name="email"]');
              const email = emailInput?.value?.trim();
              if (!email) {
                toast.error(t("loginForm.enterEmailFirst") || "أدخل البريد أولاً");
                return;
              }
              const res = await fetch("/api/auth/resend-link", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  email,
                  redirectTo:
                    process.env.NEXT_PUBLIC_SUPABASE_REDIRECT_URL ||
                    "http://localhost:3000/auth/callback",
                }),
              });
              const data = await res.json();
              if (!res.ok || !data?.actionLink) {
                throw new Error(data?.error || "فشل إرسال رابط التفعيل");
              }
              toast.success(t("loginForm.activationLinkSent") || "تم إرسال رابط التفعيل");
              // Optionally open the link
              // window.open(data.actionLink, "_blank");
            } catch (e) {
              toast.error(e?.message || "حدث خطأ أثناء إرسال الرابط");
            }
          }}
          className="text-primary underline"
        >
          {t("loginForm.resendActivation") || "إعادة إرسال رابط التفعيل"}
        </button>
      </div>
    </div>
  );
};

export default LoginForm;
