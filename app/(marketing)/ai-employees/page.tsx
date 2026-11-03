import type { Metadata } from "next";
import { AiEmployeesPage } from "@/components/ai-employees/AiEmployeesPage";
import { JsonLd } from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/metadata";
import {
  aiEmployeesServiceSchema,
  breadcrumbSchema,
  graph,
  organizationSchema,
  reginaldBenjaminSchema,
} from "@/lib/schema";

export const metadata: Metadata = pageMetadata("/ai-employees");

export default function AiEmployeesRoute() {
  return (
    <>
      <JsonLd
        data={graph(
          organizationSchema(),
          reginaldBenjaminSchema(),
          aiEmployeesServiceSchema(),
          breadcrumbSchema("/ai-employees"),
        )}
      />
      <AiEmployeesPage />
    </>
  );
}
