import { Suspense, lazy, useContext, useEffect, useState } from "react";
import "./utils/consolePatch";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { supabase } from "./lib/supabaseClient";
import { setCredentials, logout } from "./redux/slices/authSlice";
import { detectUserRole } from "./utils/roleDetection";
import DashboardLayout from "./components/Layouts/dashboard-layout/DashboardLayout";
import AdminLayout from "./components/Layouts/admin-layout/AdminLayout";
import MainLayout from "./components/Layouts/main-layout/MainLayout";
import LoadingPage from "./pages/LoadingPage";
import NotFound from "./pages/not-found/NotFound";
import { DashboardSkeleton, TablePageSkeleton, ProfileSkeleton } from "./components/shared/skeletons/PageSkeleton";

// Landing Pages - Lazy loaded for better performance
const LandingHome = lazy(() => import("./pages/landing/home/Home"));
const Login = lazy(() => import("./pages/landing/login/Login"));
const Signup = lazy(() => import("./pages/landing/signup/Signup"));
const RequestService = lazy(() => import("./pages/landing/requestService/RequestService"));
const Profile = lazy(() => import("./pages/landing/profile/Profile"));
const Explore = lazy(() => import("./pages/landing/exploreRequests/Explore"));
const Projects = lazy(() => import("./pages/landing/projects/Projects"));
const Reviews = lazy(() => import("./pages/landing/reviws/Reviews"));
const UserRequestDetails = lazy(() => import("./pages/landing/request-details/RequestDetails"));
const ProjectUserDetails = lazy(() => import("./pages/landing/project-details/ProjectUserDetails"));
const OurServices = lazy(() => import("./pages/landing/our-services/OurServices"));
const AboutUs = lazy(() => import("./pages/landing/about-us/AboutUs"));
const HowItWork = lazy(() => import("./pages/landing/howItWork/HowItWork"));
const Tickets = lazy(() => import("./pages/landing/tickets/Tickets"));

// Provider Pages - Lazy loaded
const HomeProvider = lazy(() => import("./pages/provider/home/Home"));
const ActiveOrders = lazy(() => import("./pages/provider/active-orders/ActiveOrders"));
const OurProjects = lazy(() => import("./pages/provider/our-projects/OurProjects"));
const OurRates = lazy(() => import("./pages/provider/our-rates/OurRates"));
const ProviderProjectsDetails = lazy(() => import("./pages/provider/project-details/ProviderProjectsDetails"));

// Admin Pages - Lazy loaded
const HomeAdmin = lazy(() => import("./pages/admin/home/Home"));
const Providers = lazy(() => import("./pages/admin/providers/Providers"));
const Requesters = lazy(() => import("./pages/admin/requesters/Requesters"));
const Requests = lazy(() => import("./pages/admin/requests/Requests"));
const ProjectsAdmin = lazy(() => import("./pages/admin/projects/Projects"));
const ProjectsAdminDetails = lazy(() => import("./pages/admin/project-details/ProjectsAdminDetails"));
const UsersDetails = lazy(() => import("./pages/admin/users-details/UsersDetails"));
const ProfileDetails = lazy(() => import("./pages/admin/profile-details/ProfileDetails"));
const RequestDetails = lazy(() => import("./pages/admin/request-details/RequestDetails"));
const ServicesPage = lazy(() => import("./pages/admin/services/Services"));
const TicketsPage = lazy(() => import("./pages/admin/tickets/Tickets"));
const TicketsDetails = lazy(() => import("./pages/admin/tickets/TicketsDetails"));
const FaqsAdmin = lazy(() => import("./pages/admin/faqs/Faqs"));
const PartnersAdmin = lazy(() => import("./pages/admin/partners/Partners"));
const CustomersAdmin = lazy(() => import("./pages/admin/customers/Customers"));
const ProfileInfo = lazy(() => import("./pages/admin/profile-info/ProfileInfo"));
const RatingsAdmin = lazy(() => import("./pages/admin/ratings/Ratings"));

// Components - Lazy loaded
const Faqs = lazy(() => import("./components/landing-components/home-components/faqs/Faqs"));
const Partners = lazy(() => import("./components/landing-components/home-components/partners/Partners"));
const AddQuestion = lazy(() => import("./components/admin-components/faqs/AddQuestion"));
const UpdateQuestion = lazy(() => import("./components/admin-components/faqs/UpdateQuestion"));
const UpsertPartner = lazy(() => import("./components/admin-components/partners/UpsertPartner"));
const UpsertCustomer = lazy(() => import("./components/admin-components/customers/UpsertCustomer"));
const AddService = lazy(() => import("./components/admin-components/services/AddService"));
const UpsertService = lazy(() => import("./components/admin-components/services/UpsertService"));

import AuthGuard from "./components/AuthGuard";
import GuestGuard from "./components/GuestGuard";
import BackToTopButton from "./components/BackTop";
import { LanguageContext } from "./context/LanguageContext";
import i18n from "./i18n";

// Reusable Suspense wrapper with different loading states
const withSuspense = (Component, skeletonType = "default") => {
  const getSkeleton = () => {
    switch (skeletonType) {
      case "dashboard":
        return <DashboardSkeleton />;
      case "table":
        return <TablePageSkeleton />;
      case "profile":
        return <ProfileSkeleton />;
      default:
        return <LoadingPage />;
    }
  };

  return <Suspense fallback={getSkeleton()}>{Component}</Suspense>;
};

const router = createBrowserRouter([
  // صفحات عامة (بدون حماية)
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: withSuspense(<LandingHome />, "dashboard") },
      { path: "our-services", element: withSuspense(<OurServices />) },
      { path: "about-us", element: withSuspense(<AboutUs />) },
      { path: "how-it-work", element: withSuspense(<HowItWork />) },
      { path: "faqs", element: withSuspense(<Faqs />) },
      { path: "partners", element: withSuspense(<Partners />) },
      {
        path: "login",
        element: <GuestGuard>{withSuspense(<Login />)}</GuestGuard>,
      },
      {
        path: "signup",
        element: <GuestGuard>{withSuspense(<Signup />)}</GuestGuard>,
      },
      {
        path: "signup-provider",
        element: <GuestGuard>{withSuspense(<Signup />)}</GuestGuard>,
      },
    ],
  },
  // صفحات Requester المحمية
  {
    path: "/",
    element: (
      <AuthGuard allowedRoles={["Requester"]}>
        <MainLayout />
      </AuthGuard>
    ),
    children: [
      { path: "request-service", element: withSuspense(<RequestService />) },
      { path: "requests", element: withSuspense(<Explore />) },
      { path: "requests/:id", element: withSuspense(<UserRequestDetails />) },
      { path: "tickets", element: withSuspense(<Tickets />) },
      { path: "projects", element: withSuspense(<Projects />) },
      { path: "projects/:id", element: withSuspense(<ProjectUserDetails />) },
      {
        path: "profile",
        children: [
          { index: true, element: withSuspense(<Profile />) },
          { path: "reviews", element: withSuspense(<Reviews />) },
          { path: "*", element: <NotFound /> },
        ],
      },
    ],
  },

  {
    path: "/provider",
    element: (
      <AuthGuard allowedRoles={["Provider"]}>
        <DashboardLayout />
      </AuthGuard>
    ),
    children: [
      { index: true, element: withSuspense(<HomeProvider />) },
      { path: "active-orders", element: withSuspense(<ActiveOrders />) },
      { path: "our-projects", element: withSuspense(<OurProjects />) },
      { path: "our-rates", element: withSuspense(<OurRates />) },
      { path: "profile", element: withSuspense(<ProfileDetails />) },

      // Tickets
      { path: "tickets", element: withSuspense(<TicketsPage />) },
      { path: "tickets/:id", element: withSuspense(<TicketsDetails />) },
      {
        path: "projects/:id",
        element: withSuspense(<ProviderProjectsDetails />),
      },

      { path: "*", element: <NotFound /> },
    ],
  },
  {
    path: "/admin",
    element: (
      <AuthGuard allowedRoles={["Admin"]}>
        <AdminLayout />
      </AuthGuard>
    ),
    children: [
      { index: true, element: withSuspense(<HomeAdmin />) },

      // Providers
      { path: "providers", element: withSuspense(<Providers />, "table") },
      { path: "providers/:id", element: withSuspense(<UsersDetails />) },

      // Requesters
      { path: "requesters", element: withSuspense(<Requesters />, "table") },
      { path: "requesters/:id", element: withSuspense(<UsersDetails />) },

      { path: "profile", element: withSuspense(<ProfileDetails />) },

      // Requests
      { path: "requests", element: withSuspense(<Requests />, "table") },
      { path: "requests/:id", element: withSuspense(<RequestDetails />) },

      // Tickets
      { path: "tickets", element: withSuspense(<TicketsPage />) },
      { path: "tickets/:id", element: withSuspense(<TicketsDetails />) },

      // Services
      { path: "services", element: withSuspense(<ServicesPage />) },
      { path: "add-service", element: withSuspense(<AddService />) },
      { path: "services/:id/edit", element: withSuspense(<UpsertService />) },

      // Projects
      { path: "projects", element: withSuspense(<ProjectsAdmin />, "table") },
      { path: "projects/:id", element: withSuspense(<ProjectsAdminDetails />) },

      // Ratings
      { path: "ratings", element: withSuspense(<RatingsAdmin />) },

      { path: "our-rates", element: withSuspense(<OurRates />) },

      { path: "faqs", element: withSuspense(<FaqsAdmin />) },
      { path: "add-questions", element: withSuspense(<AddQuestion />) },
      {
        path: "update-question/:id",
        element: withSuspense(<UpdateQuestion />),
      },

      { path: "partners", element: withSuspense(<PartnersAdmin />) },
      { path: "add-partner", element: withSuspense(<UpsertPartner />) },
      {
        path: "update-partner/:id",
        element: withSuspense(<UpsertPartner />),
      },

      { path: "profile-info", element: withSuspense(<ProfileInfo />) },

      { path: "customers", element: withSuspense(<CustomersAdmin />) },
      { path: "add-customer", element: withSuspense(<UpsertCustomer />) },
      {
        path: "update-customer/:id",
        element: withSuspense(<UpsertCustomer />),
      },

      { path: "*", element: <NotFound /> },
    ],
  },
]);

// Component to handle auth initialization
function AuthInitializer({ children }) {
  const dispatch = useDispatch();
  const { token, role } = useSelector((state) => state.auth);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // التحقق من Supabase session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          setIsInitializing(false);
          return;
        }

        if (session && session.user) {
          // إذا كان هناك session لكن لا يوجد role في Redux
          if (!role || !token) {
            try {
              const userRole = await detectUserRole(session.user, session);
              
              if (userRole) {
                dispatch(
                  setCredentials({
                    token: session.access_token,
                    refreshToken: session.refresh_token || null,
                    role: userRole,
                    userId: session.user.id,
                  })
                );
              }
            } catch (err) {
              console.error("Error detecting role:", err);
            }
          }
        } else {
          if (token || role) {
            dispatch(logout());
          }
        }
      } catch (err) {
        console.error("Error initializing auth:", err);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();

    // الاستماع لتغييرات auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_OUT" || !session) {
          dispatch(logout());
        } else if (event === "SIGNED_IN" && session) {
          // إذا تم تسجيل الدخول، جلب الدور
          try {
            const userRole = await detectUserRole(session.user, session);
            
            if (userRole) {
              dispatch(
                setCredentials({
                  token: session.access_token,
                  refreshToken: session.refresh_token || null,
                  role: userRole,
                  userId: session.user.id,
                })
              );
            }
          } catch (err) {
            console.error("Error detecting role on sign in:", err);
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch, token, role]);

  if (isInitializing) {
    return <LoadingPage />;
  }

  return children;
}

function App() {
  const { lang } = useContext(LanguageContext);
  useEffect(() => {
    if (lang && ["en", "ar"].includes(lang)) {
      i18n.changeLanguage(lang);
      document.documentElement.setAttribute(
        "dir",
        lang === "ar" ? "rtl" : "ltr"
      );
    }
  }, [lang]);
  return (
    <div className={lang === "ar" ? "dir-rtl" : "dir-ltr"}>
      <BackToTopButton />
      <AuthInitializer>
        <RouterProvider router={router} />
      </AuthInitializer>
    </div>
  );
}

export default App;
