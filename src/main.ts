import { parse } from "../deps.ts";

interface CommuterTown {
  townName: string;
  travelTime: number;
  housePrice: number;
  satisfaction: number;
}

const getTowns = async () =>
  Deno.readTextFile("./src/data.json").then(JSON.parse);

const rightPadCrop = (s: string, l: number) => {
  const len = s.length;
  if (len >= l) {
    return s.slice(0, l);
  }
  return s.concat(
    Array(l - len)
      .fill(" ")
      .join("")
  );
};

const formatTown = (town: CommuterTown): string => {
  const name = rightPadCrop(town.townName, 20);
  const travelTime = rightPadCrop(`${town.travelTime}m`, 7);
  const hp = rightPadCrop(`£${Math.ceil(town.housePrice / 1000)}k`, 7);
  return [name, travelTime, hp].join(" | ");
};
const runProgram = async () => {
  const args = parse(Deno.args);
  console.log(args);
  const rawData = await getTowns();
  let towns = rawData.map(
    (t: any): CommuterTown => ({
      townName: t.town_name,
      travelTime: parseInt(t.travel_time, 10),
      housePrice: parseInt(t.house_price, 10),
      satisfaction: parseFloat(t.satisfaction),
    })
  );
  towns = towns.sort((a: CommuterTown, b: CommuterTown) =>
    a.townName.localeCompare(b.townName)
  );

  if (args.pricemax) {
    towns = towns.filter(
      (t: CommuterTown) =>
        t.housePrice <=
        (args.pricemax < 1000 ? args.pricemax * 1000 : args.pricemax)
    );
  }
  if (args.timemax) {
    towns = towns.filter((t: CommuterTown) => t.travelTime <= args.timemax);
  }
  if (args.timemin) {
    towns = towns.filter((t: CommuterTown) => t.travelTime > args.timemin);
  }
  if (args.sortprice) {
    towns = towns.sort(
      (a: CommuterTown, b: CommuterTown) => a.housePrice - b.housePrice
    );
  }
  if (args.sorttime) {
    console.log(`sort by time`)
    towns = towns.sort(
      (a: CommuterTown, b: CommuterTown) => a.travelTime - b.travelTime
    );
  }

  return [
    "TOWN NAME            |  TIME   | £PRICE",
    "---------------------------------------",
  ]
    .concat(towns.map(formatTown))
    .join("\n");
};

runProgram().then((results) => {
  console.log(results);
});

export {};
