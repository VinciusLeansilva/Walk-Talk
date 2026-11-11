import { HealthPage } from "../../src/portal/HealthPage";
export const metadata = {
  title: "Saúde e ergonomia no trabalho",
  description:
    "Informações educativas sobre prevenção de LER/DORT, ergonomia, pausas e organização do trabalho, com referências oficiais.",
};
export default function HealthInformationPage() {
  return <HealthPage standalone />;
}
