import React from "react";
import ServerDetailsClient from "./ServerDetailsClient";

export function generateStaticParams() {
  return [
    { id: "demo" },
    { id: "srv-01" },
    { id: "srv-02" },
    { id: "srv-03" },
  ];
}

export default function ServerDetailsPage() {
  return <ServerDetailsClient />;
}
