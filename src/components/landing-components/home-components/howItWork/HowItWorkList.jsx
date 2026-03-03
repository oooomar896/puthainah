import React, { useRef, useEffect } from "react";
import subscripeArrow from "../../../../assets/icons/subscripeArrow.svg";
import HowItWorkCard from "./HowItWorkCard";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const HowItWorkList = () => {
  const { t } = useTranslation();
  const role = useSelector((state) => state.auth.role);
  const containerRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.from(".how-it-work-item", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%",
        },
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.2,
        ease: "power3.out",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const howItWork = [
    {
      id: 1,
      title: t("howItWorks.step1"),
    },
    {
      id: 2,
      title: t("howItWorks.step2"),
    },
    {
      id: 3,
      title: t("howItWorks.step3"),
      link: {
        name:
          role === "Requester"
            ? t("howItWorks.requestService")
            : t("howItWorks.subscribeNow"),
        icon: subscripeArrow,
        href: role === "Requester" ? "/request-service" : "/signup",
      },
    },
  ];

  return (
    <div ref={containerRef} className="flex flex-col gap-2">
      {howItWork?.map((item) => (
        <div
          key={item?.id}
          className="how-it-work-item"
        >
          <HowItWorkCard item={item} />
        </div>
      ))}
    </div>
  );
};

export default HowItWorkList;
