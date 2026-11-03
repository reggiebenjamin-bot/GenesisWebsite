import Image from "next/image";
import { Sheet } from "@/components/ui/Blocks";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Section";
import { aiEmployeePersonas, aiEmployeesHome } from "@/lib/aiEmployees";

function TitleWithAccent({ title, accent }: { title: string; accent: string }) {
  const at = title.lastIndexOf(accent);
  if (at < 0) return title;
  return (
    <>
      {title.slice(0, at)}
      <span className="text-gold-light">{title.slice(at)}</span>
    </>
  );
}

/** The homepage introduction to AI employees. The full offer lives on its own page. */
export function AiEmployeesHomeSection() {
  return (
    <Sheet surface="ink" rise aria-labelledby="ai-employees-home-title" className="site-section text-center">
      <Image
        src="/brand/genesis-logo-gradient.svg"
        alt=""
        width={64}
        height={64}
        className="mx-auto h-16 w-16"
      />
      <div className="mx-auto mt-6 h-px w-16 bg-gold" />
      <div className="mx-auto mt-8 max-w-[40rem]">
        <Eyebrow>{aiEmployeesHome.eyebrow}</Eyebrow>
        <h2
          id="ai-employees-home-title"
          className="mt-4 font-light text-[clamp(2.2rem,4.4vw,3.9rem)] leading-[1.02] tracking-[-0.045em] text-balance"
        >
          <TitleWithAccent title={aiEmployeesHome.title} accent={aiEmployeesHome.accent} />
        </h2>
        <p className="mx-auto mt-5 max-w-[46ch] text-[1.02rem] leading-relaxed text-muted-light">
          {aiEmployeesHome.summary}
        </p>
      </div>

      <ul className="mx-auto mt-10 grid max-w-[880px] gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {aiEmployeePersonas.map((persona) => (
          <li key={persona.id} className="rounded-[6px] border border-line-dark px-4 py-5">
            <p className="font-light text-[1.45rem] tracking-[-0.03em]">{persona.name}</p>
            <p className="mt-2 font-display text-[0.62rem] leading-relaxed tracking-[0.14em] text-gold uppercase">
              {persona.role}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-10">
        <Button href="/ai-employees" variant="secondary">
          {aiEmployeesHome.action}
        </Button>
      </div>
    </Sheet>
  );
}
