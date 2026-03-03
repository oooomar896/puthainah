import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Hero from "@/components/landing-components/home-components/hero/Hero";
import { servicesService } from "@/services/api";
import { useTranslation } from "react-i18next";
import MainLayout from "@/components/Layouts/main-layout/MainLayout";

// Dynamic imports for heavy below-the-fold components
const Services = dynamic(() => import("@/components/landing-components/home-components/services/Services"), {
    ssr: true // SEO content is important for services
});
const AboutUs = dynamic(() => import("@/components/landing-components/home-components/aboutUs/AboutUs"));
const HowItWork = dynamic(() => import("@/components/landing-components/home-components/howItWork/HowItWork"));
const Join = dynamic(() => import("@/components/landing-components/home-components/joinNow/Join"));
const Faqs = dynamic(() => import("@/components/landing-components/home-components/faqs/Faqs"));
const Partners = dynamic(() => import("@/components/landing-components/home-components/partners/Partners"));
const Customers = dynamic(() => import("@/components/landing-components/home-components/customers/Customers"));

const Home = () => {
    const { t } = useTranslation();
    const [services, setServices] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchServices = async () => {
            try {
                // Fetch services but don't let it crash the page if it fails
                const { data, error } = await servicesService.getAll();
                if (data && !error) {
                    setServices(data);
                } else if (error) {
                    console.warn("Supabase logic: Using local fallback for services due to API error.");
                }
            } catch (error) {
                // Silently handle error to keep the page functional
                console.warn("Fetch failed, showing professional default data.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchServices();
    }, []);

    return (
        <MainLayout>
            <div className="bg-white">
                <title>{t("home.metaTitle")}</title>
                <meta name="description" content={t("about.metaDescription")} />
                <Hero />
                <Services data={services} isLoading={isLoading} />
                <AboutUs />
                <HowItWork />
                <Join />
                <Faqs />
                <Partners />
                <Customers />
            </div>
        </MainLayout>
    );
};

export default Home;
