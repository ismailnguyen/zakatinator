import type { Context, Config } from "@netlify/functions";

export default async (req: Request, context: Context) => {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const currency = pathParts[pathParts.length - 1] || "USD";

    // The external API URL
    const externalApiUrl = `https://data-asg.goldprice.org/dbXRates/${currency}`;

    try {
        const response = await fetch(externalApiUrl, {
            method: "GET",
            headers: {
                // Mimic a standard browser request or keep it clean
                "User-Agent": "Mozilla/5.0 (compatible; Zakatinator/1.0)",
                "Accept": "application/json",
            },
        });

        if (!response.ok) {
            return new Response(`Error fetching from upstream: ${response.statusText}`, { status: response.status });
        }

        const data = await response.json();

        return new Response(JSON.stringify(data), {
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*", // Allow all origins (or restrict to your domain)
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Cache-Control": "public, max-age=300", // Cache for 5 minutes
            },
        });
    } catch (error) {
        console.error("Proxy error:", error);
        return new Response(JSON.stringify({ error: "Failed to fetch data" }), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
        });
    }
};

export const config: Config = {
    path: "/api/gold-price/*",
};
