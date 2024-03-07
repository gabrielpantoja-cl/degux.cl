import { fetchRevenue } from "../lib/data";

export default async function Page() {
    const revenue = await fetchRevenue();

    return <div>esta pagina es el contenido del dashboard
        Revenue: {revenue}</div>;
}