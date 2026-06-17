import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { formatTokens } from "@/lib/utils";

export default async function WidgetPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const creator = await db.user.findUnique({ where: { username }, select: { name: true, username: true } });
  if (!creator) notFound();

  const totals = await db.support.aggregate({
    where: { creatorId: (await db.user.findUnique({ where: { username } }))?.id ?? "" },
    _sum: { amount: true },
  });

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, sans-serif; }
          body { background: #18181b; color: #f4f4f5; padding: 16px; border-radius: 12px; }
          .name { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
          .total { font-size: 11px; color: #a1a1aa; margin-bottom: 12px; }
          a { display: block; background: linear-gradient(135deg, #f97316, #a855f7); color: white; text-decoration: none; text-align: center; padding: 10px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; }
          a:hover { opacity: 0.9; }
        `}</style>
      </head>
      <body>
        <div className="name">{creator.name ?? creator.username}</div>
        <div className="total">
          {totals._sum.amount ? `${formatTokens(totals._sum.amount)} tokens received` : "Support with AI tokens"}
        </div>
        <a href={`https://givemesometokens.dev/@${creator.username}`} target="_blank" rel="noopener noreferrer">
          Fuel My Agent
        </a>
      </body>
    </html>
  );
}
