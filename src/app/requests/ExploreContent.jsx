"use client";

import React, { useEffect } from "react";
import ExploreRequests from "@/components/landing-components/ExploreRequests/ExploreRequests";

const ExploreContent = ({ stats }) => {

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="py-9">
      <div className="container">
        <div className="grid grid-cols-2">
          <div className="col-span-2">
            <ExploreRequests stats={stats} />
          </div>
          <div></div>
        </div>
      </div>
    </div>
  );
};

export default ExploreContent;
