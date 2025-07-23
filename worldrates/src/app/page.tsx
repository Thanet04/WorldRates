import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold">World Rates</h1>
      <p className="text-lg">
        This is a simple app that shows the world rates of different countries.
      </p>
      <div className="flex flex-col items-center justify-center">
        <input type="text" placeholder="Search for a country" />
        <button>Search</button>
      </div>
    </div>
  );
}
