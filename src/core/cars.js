/**
 * A car object
 * @typedef {Object} Car
 * @property {number} id - The unique identifier for the car.
 * @property {number} carmodel_id - The identifier for the car model.
 * @property {string} car_name - The name of the car.
 * @property {number|null} base_class_id - The identifier for the base class.
 * @property {string|null} base_class_name - The name of the base class.
 * @property {number|null} sub_class_id - The identifier for the subclass.
 * @property {string|null} sub_class_name - The name of the subclass.
 */


/**
 * Provides functions to retrieve car information based on car name and to map 
 * base group and subgroup IDs to their respective class names. 
 * @param {string} carName 
 * @returns {Car}
 */
export function getCarByName(carName) {
  if (!CAR_LIST.has(carName)) {
    return {
      id: null,
      carmodel_id: null,
      car_name: carName,
      base_class_id: null,
      base_class_name: null,
      sub_class_id: null,
      sub_class_name: null,
    };
  }

  const car = CAR_LIST.get(carName);

  return {
    id: car.id,
    carmodel_id: car.carmodel_id,
    car_name: carName,
    base_class_id: car.base_group_id,
    base_class_name: BASE_GROUP_ID_TO_CLASS_NAME.get(car.base_group_id),
    sub_class_id: car.subgroup_id,
    sub_class_name: SUBGROUP_ID_TO_CLASS_NAME.get(car.subgroup_id),
  };
}

export const BASE_GROUP_ID_TO_CLASS_NAME = new Map([
  [10, "WRC 1.6"],
  [11, "WRC 2.0"],
  [21, "Group 2"],
  [22, "Group 4"],
  [23, "Group A5"],
  [24, "Group A7"],
  [30, "Group A8"],
  [31, "Group B"],
  [32, "Group N4"],
  [33, "Group R1"],
  [34, "Group R2"],
  [35, "Group R3"],
  [36, "Group R4"],
  [37, "Group R5"],
  [38, "Group RGT"],
  [71, "Super 1600"],
  [78, "Group A6"],
  [104, "Rally 4"],
  [108, "Rally 3"],
  [111, "Super 2000"],
  [118, "Rally 5"],
  [125, "Rally 2"],
]);

const SUBGROUP_ID_TO_CLASS_NAME = new Map([
  [10, "WRC 2013-2016"],
  [11, "WRC 2017-2021"],
  [21, "Group 4 (RWD)"],
  [22, "Group 4 (AWD)"],
  [25, "Group A7 (A7K)"],
  [26, "Group A7 (A7)"],
  [30, "Group A8 (pre-1990)"],
  [31, "Group A8 (1990-1995)"],
  [40, "Group B (RWD)"],
  [41, "Group B (AWD)"],
]);

const CAR_LIST = new Map([
  [
    "Abarth Grande Punto S2000",
    {
      id: 91,
      carmodel_id: 253,
      base_group_id: 111,
      subgroup_id: null,
    },
  ],
  [
    "Alpine A110 Rally RGT",
    {
      id: 83,
      carmodel_id: 247,
      base_group_id: 38,
      subgroup_id: null,
    },
  ],
  [
    "Aston Martin Vantage RGT",
    {
      id: 62,
      carmodel_id: 235,
      base_group_id: 38,
      subgroup_id: null,
    },
  ],
  [
    "Audi 200 quattro GrpA",
    {
      id: 72,
      carmodel_id: 165,
      base_group_id: 30,
      subgroup_id: 30,
    },
  ],
  [
    "Audi quattro A1 GrpB",
    {
      id: 66,
      carmodel_id: 192,
      base_group_id: 31,
      subgroup_id: 41,
    },
  ],
  [
    "Audi quattro A2 GrpB",
    {
      id: 67,
      carmodel_id: 236,
      base_group_id: 31,
      subgroup_id: 41,
    },
  ],
  [
    "Audi quattro Grp4",
    {
      id: 18,
      carmodel_id: 204,
      base_group_id: 22,
      subgroup_id: 22,
    },
  ],
  [
    "Audi Sport quattro GrpB",
    {
      id: 68,
      carmodel_id: 131,
      base_group_id: 31,
      subgroup_id: 41,
    },
  ],
  [
    "BMW M1 GrpB",
    {
      id: 99,
      carmodel_id: 256,
      base_group_id: 31,
      subgroup_id: 40,
    },
  ],
  [
    "BMW M3 E30 GrpA",
    {
      id: 87,
      carmodel_id: 97,
      base_group_id: 30,
      subgroup_id: 31,
    },
  ],
  [
    "BMW M3 E36 GrpA",
    {
      id: 89,
      carmodel_id: 252,
      base_group_id: 30,
      subgroup_id: 31,
    },
  ],
  [
    "Citroen C2 GT S1600",
    {
      id: 54,
      carmodel_id: 44,
      base_group_id: 71,
      subgroup_id: null,
    },
  ],
  [
    "Citroen C2 R2 Max",
    {
      id: 27,
      carmodel_id: 115,
      base_group_id: 34,
      subgroup_id: null,
    },
  ],
  [
    "Citroen C3 R5",
    {
      id: 69,
      carmodel_id: 212,
      base_group_id: 37,
      subgroup_id: null,
    },
  ],
  [
    "Citroen C3 WRC 2017",
    {
      id: 14,
      carmodel_id: 191,
      base_group_id: 10,
      subgroup_id: 11,
    },
  ],
  [
    "Citroen C4 WRC 2008",
    {
      id: 12,
      carmodel_id: 257,
      base_group_id: 11,
      subgroup_id: null,
    },
  ],
  [
    "Citroen DS3 R1",
    {
      id: 25,
      carmodel_id: 143,
      base_group_id: 33,
      subgroup_id: null,
    },
  ],
  [
    "Citroen DS3 R3-MAX",
    {
      id: 32,
      carmodel_id: 118,
      base_group_id: 35,
      subgroup_id: null,
    },
  ],
  [
    "Citroen DS3 R5",
    {
      id: 51,
      carmodel_id: 150,
      base_group_id: 37,
      subgroup_id: null,
    },
  ],
  [
    "Citroen DS3 WRC",
    {
      id: 8,
      carmodel_id: 78,
      base_group_id: 10,
      subgroup_id: 10,
    },
  ],
  [
    "Citroen Xsara Kit Car",
    {
      id: 94,
      carmodel_id: 255,
      base_group_id: 24,
      subgroup_id: 25,
    },
  ],
  [
    "Citroen Xsara WRC 2006",
    {
      id: 13,
      carmodel_id: 18,
      base_group_id: 11,
      subgroup_id: null,
    },
  ],
  [
    "Fiat 124 Abarth Rally RGT",
    {
      id: 40,
      carmodel_id: 213,
      base_group_id: 38,
      subgroup_id: null,
    },
  ],
  [
    "Fiat 126 Grp2",
    {
      id: 17,
      carmodel_id: 200,
      base_group_id: 21,
      subgroup_id: null,
    },
  ],
  [
    "Fiat 131 Abarth Grp4",
    {
      id: 100,
      carmodel_id: 258,
      base_group_id: 22,
      subgroup_id: 21,
    },
  ],
  [
    "Fiat Abarth 500 R3T",
    {
      id: 97,
      carmodel_id: 119,
      base_group_id: 35,
      subgroup_id: null,
    },
  ],
  [
    "Ford Escort Mk II RS Grp4",
    {
      id: 78,
      carmodel_id: 241,
      base_group_id: 22,
      subgroup_id: 21,
    },
  ],
  [
    "Ford Escort Mk V RS Cosworth Grp",
    {
      id: 43,
      carmodel_id: 40,
      base_group_id: 30,
      subgroup_id: 31,
    },
  ],
  [
    "Ford Fiesta Mk VI S2000",
    {
      id: 92,
      carmodel_id: 68,
      base_group_id: 111,
      subgroup_id: null,
    },
  ],
  [
    "Ford Fiesta Mk VIII R2",
    {
      id: 71,
      carmodel_id: 237,
      base_group_id: 34,
      subgroup_id: null,
    },
  ],
  [
    "Ford Fiesta R2",
    {
      id: 28,
      carmodel_id: 228,
      base_group_id: 34,
      subgroup_id: null,
    },
  ],
  [
    "Ford Fiesta R5",
    {
      id: 37,
      carmodel_id: 151,
      base_group_id: 37,
      subgroup_id: null,
    },
  ],
  [
    "Ford Fiesta Rally2",
    {
      id: 81,
      carmodel_id: 262,
      base_group_id: 125,
      subgroup_id: null,
    },
  ],
  [
    "Ford Fiesta Rally3",
    {
      id: 88,
      carmodel_id: 251,
      base_group_id: 108,
      subgroup_id: null,
    },
  ],
  [
    "Ford Fiesta rally3 evo",
    {
      id: 109,
      carmodel_id: 266,
      base_group_id: 108,
      subgroup_id: null,
    },
  ],
  [
    "Ford Fiesta Rally4",
    {
      id: 80,
      carmodel_id: 244,
      base_group_id: 104,
      subgroup_id: null,
    },
  ],
  [
    "Ford Fiesta RS WRC 2014",
    {
      id: 9,
      carmodel_id: 157,
      base_group_id: 10,
      subgroup_id: 10,
    },
  ],
  [
    "Ford Fiesta WRC 2019",
    {
      id: 11,
      carmodel_id: 226,
      base_group_id: 10,
      subgroup_id: 11,
    },
  ],
  [
    "Ford Focus Mk II RS WRC 2006",
    {
      id: 55,
      carmodel_id: 17,
      base_group_id: 11,
      subgroup_id: null,
    },
  ],
  [
    "Honda Civic Type R(FN2) R3",
    {
      id: 33,
      carmodel_id: 83,
      base_group_id: 35,
      subgroup_id: null,
    },
  ],
  [
    "Hyundai i20 Coupe WRC 2017",
    {
      id: 15,
      carmodel_id: 188,
      base_group_id: 10,
      subgroup_id: 11,
    },
  ],
  [
    "Hyundai i20 Coupe WRC 2020",
    {
      id: 76,
      carmodel_id: 239,
      base_group_id: 10,
      subgroup_id: 11,
    },
  ],
  [
    "Hyundai i20 Coupe WRC 2021",
    {
      id: 104,
      carmodel_id: 261,
      base_group_id: 10,
      subgroup_id: 11,
    },
  ],
  [
    "Hyundai i20 N Rally2",
    {
      id: 102,
      carmodel_id: 259,
      base_group_id: 125,
      subgroup_id: null,
    },
  ],
  [
    "Hyundai i20 R5",
    {
      id: 38,
      carmodel_id: 152,
      base_group_id: 37,
      subgroup_id: null,
    },
  ],
  [
    "Lada Kalina RC2 GrpA",
    {
      id: 60,
      carmodel_id: 219,
      base_group_id: 78,
      subgroup_id: null,
    },
  ],
  [
    "Lada VFTS GrpB",
    {
      id: 41,
      carmodel_id: 134,
      base_group_id: 31,
      subgroup_id: 40,
    },
  ],
  [
    "Lancia Delta HF 4WD GrpA",
    {
      id: 73,
      carmodel_id: 166,
      base_group_id: 30,
      subgroup_id: 30,
    },
  ],
  [
    "Lancia Stratos HF Grp4",
    {
      id: 84,
      carmodel_id: 248,
      base_group_id: 22,
      subgroup_id: 21,
    },
  ],
  [
    "Lotus Exige S RGT",
    {
      id: 64,
      carmodel_id: 184,
      base_group_id: 38,
      subgroup_id: null,
    },
  ],
  [
    "Mazda 323 BF 4WD Turbo GrpA",
    {
      id: 74,
      carmodel_id: 169,
      base_group_id: 30,
      subgroup_id: 30,
    },
  ],
  [
    "Mini JCW WRC",
    {
      id: 101,
      carmodel_id: 160,
      base_group_id: 10,
      subgroup_id: 10,
    },
  ],
  [
    "Mitsubishi Lancer Evo II GrpA",
    {
      id: 49,
      carmodel_id: 173,
      base_group_id: 30,
      subgroup_id: 31,
    },
  ],
  [
    "Mitsubishi Lancer Evo IX N4",
    {
      id: 24,
      carmodel_id: 22,
      base_group_id: 32,
      subgroup_id: null,
    },
  ],
  [
    "Mitsubishi Lancer Evo IX R4",
    {
      id: 48,
      carmodel_id: 22,
      base_group_id: 36,
      subgroup_id: null,
    },
  ],
  [
    "Mitsubishi Lancer Evo X R4",
    {
      id: 56,
      carmodel_id: 163,
      base_group_id: 36,
      subgroup_id: null,
    },
  ],
  [
    "Opel ADAM R2",
    {
      id: 29,
      carmodel_id: 145,
      base_group_id: 34,
      subgroup_id: null,
    },
  ],
  [
    "Opel Ascona 400 Grp4",
    {
      id: 19,
      carmodel_id: 137,
      base_group_id: 22,
      subgroup_id: 21,
    },
  ],
  [
    "Opel Manta 400 GrpB",
    {
      id: 65,
      carmodel_id: 138,
      base_group_id: 31,
      subgroup_id: 40,
    },
  ],
  [
    "Peugeot 106 Rallye S20 GrpA",
    {
      id: 86,
      carmodel_id: 250,
      base_group_id: 78,
      subgroup_id: null,
    },
  ],
  [
    "Peugeot 205 T16 GrpB",
    {
      id: 70,
      carmodel_id: 139,
      base_group_id: 31,
      subgroup_id: 41,
    },
  ],
  [
    "Peugeot 207 S2000 Evolution Plus",
    {
      id: 90,
      carmodel_id: 182,
      base_group_id: 111,
      subgroup_id: null,
    },
  ],
  [
    "Peugeot 208 R2",
    {
      id: 30,
      carmodel_id: 229,
      base_group_id: 34,
      subgroup_id: null,
    },
  ],
  [
    "Peugeot 208 Rally4",
    {
      id: 85,
      carmodel_id: 249,
      base_group_id: 104,
      subgroup_id: null,
    },
  ],
  [
    "Peugeot 208 T16 R5",
    {
      id: 103,
      carmodel_id: 260,
      base_group_id: 37,
      subgroup_id: null,
    },
  ],
  [
    "Peugeot 306 Maxi Kit Car",
    {
      id: 95,
      carmodel_id: 48,
      base_group_id: 24,
      subgroup_id: 25,
    },
  ],
  [
    "Porsche 911 GT3 RS (2007) RGT",
    {
      id: 63,
      carmodel_id: 186,
      base_group_id: 38,
      subgroup_id: null,
    },
  ],
  [
    "Porsche 911 GT3 RS (2010) RGT",
    {
      id: 50,
      carmodel_id: 243,
      base_group_id: 38,
      subgroup_id: null,
    },
  ],
  [
    "Porsche 911 SC 3.0 Grp4",
    {
      id: 52,
      carmodel_id: 209,
      base_group_id: 22,
      subgroup_id: 21,
    },
  ],
  [
    "Porsche 911 SC RS GrpB",
    {
      id: 23,
      carmodel_id: 141,
      base_group_id: 31,
      subgroup_id: 40,
    },
  ],
  [
    "Renault 5 GT Turbo GrpA",
    {
      id: 44,
      carmodel_id: 232,
      base_group_id: 24,
      subgroup_id: 26,
    },
  ],
  [
    "Renault Clio 16S Williams GrpA",
    {
      id: 21,
      carmodel_id: 88,
      base_group_id: 24,
      subgroup_id: 26,
    },
  ],
  [
    "Renault Clio III R3",
    {
      id: 34,
      carmodel_id: 47,
      base_group_id: 35,
      subgroup_id: null,
    },
  ],
  [
    "Renault Clio IV R3T",
    {
      id: 35,
      carmodel_id: 189,
      base_group_id: 35,
      subgroup_id: null,
    },
  ],
  [
    "Renault Clio Rally3",
    {
      id: 108,
      carmodel_id: 265,
      base_group_id: 108,
      subgroup_id: null,
    },
  ],
  [
    "Renault Clio Rally4",
    {
      id: 93,
      carmodel_id: 254,
      base_group_id: 104,
      subgroup_id: null,
    },
  ],
  [
    "Renault Clio Rally5",
    {
      id: 96,
      carmodel_id: 254,
      base_group_id: 118,
      subgroup_id: null,
    },
  ],
  [
    "Renault Twingo R1",
    {
      id: 26,
      carmodel_id: 147,
      base_group_id: 33,
      subgroup_id: null,
    },
  ],
  [
    "Renault Twingo R2 Evo",
    {
      id: 31,
      carmodel_id: 148,
      base_group_id: 34,
      subgroup_id: null,
    },
  ],
  [
    "Seat Leon Cupra R GrpN",
    {
      id: 79,
      carmodel_id: 242,
      base_group_id: 32,
      subgroup_id: null,
    },
  ],
  [
    "Skoda 130 LR GrpB",
    {
      id: 61,
      carmodel_id: 124,
      base_group_id: 31,
      subgroup_id: 40,
    },
  ],
  [
    "Skoda 130 RS Grp2",
    {
      id: 58,
      carmodel_id: 95,
      base_group_id: 21,
      subgroup_id: null,
    },
  ],
  [
    "Skoda Fabia R5",
    {
      id: 39,
      carmodel_id: 225,
      base_group_id: 37,
      subgroup_id: null,
    },
  ],
  [
    "Skoda Fabia R5 evo",
    {
      id: 42,
      carmodel_id: 231,
      base_group_id: 37,
      subgroup_id: null,
    },
  ],
  [
    "Skoda Fabia RS Rally2",
    {
      id: 106,
      carmodel_id: 263,
      base_group_id: 125,
      subgroup_id: null,
    },
  ],
  [
    "Skoda Fabia S2000 Evo 2",
    {
      id: 98,
      carmodel_id: 183,
      base_group_id: 111,
      subgroup_id: null,
    },
  ],
  [
    "Skoda Fabia WRC 2006",
    {
      id: 82,
      carmodel_id: 246,
      base_group_id: 11,
      subgroup_id: null,
    },
  ],
  [
    "Skoda Favorit 136 L GrpA",
    {
      id: 59,
      carmodel_id: 216,
      base_group_id: 23,
      subgroup_id: null,
    },
  ],
  [
    "Subaru Impreza GC8 555 GrpA",
    {
      id: 22,
      carmodel_id: 55,
      base_group_id: 30,
      subgroup_id: 31,
    },
  ],
  [
    "Subaru Impreza GDA WRC2003 (S9)",
    {
      id: 57,
      carmodel_id: 105,
      base_group_id: 11,
      subgroup_id: null,
    },
  ],
  [
    "Subaru Impreza N14 N4",
    {
      id: 47,
      carmodel_id: 230,
      base_group_id: 32,
      subgroup_id: null,
    },
  ],
  [
    "Subaru Impreza N15 R4",
    {
      id: 36,
      carmodel_id: 230,
      base_group_id: 36,
      subgroup_id: null,
    },
  ],
  [
    "Toyota Celica 2000GT(ST185) GrpA",
    {
      id: 53,
      carmodel_id: 234,
      base_group_id: 30,
      subgroup_id: 31,
    },
  ],
  [
    "Toyota Celica TCT (TA64) GrpB",
    {
      id: 77,
      carmodel_id: 240,
      base_group_id: 31,
      subgroup_id: 40,
    },
  ],
  [
    "Toyota GR Yaris Rally2",
    {
      id: 107,
      carmodel_id: 264,
      base_group_id: 125,
      subgroup_id: null,
    },
  ],
  [
    "Toyota Yaris WRC 2018",
    {
      id: 16,
      carmodel_id: 227,
      base_group_id: 10,
      subgroup_id: 11,
    },
  ],
  [
    "Trabant P 800 RS GrpA",
    {
      id: 20,
      carmodel_id: 217,
      base_group_id: 23,
      subgroup_id: null,
    },
  ],
  [
    "Volvo 240 Turbo GrpA",
    {
      id: 105,
      carmodel_id: 45,
      base_group_id: 30,
      subgroup_id: 30,
    },
  ],
  [
    "VW Golf II GTI 16V GrpA",
    {
      id: 75,
      carmodel_id: 238,
      base_group_id: 24,
      subgroup_id: 26,
    },
  ],
  [
    "VW Polo GTI R5",
    {
      id: 45,
      carmodel_id: 233,
      base_group_id: 37,
      subgroup_id: null,
    },
  ],
  [
    "VW Polo R WRC 2016",
    {
      id: 10,
      carmodel_id: 162,
      base_group_id: 10,
      subgroup_id: 10,
    },
  ],
  [
    "Wartburg 353 W 460 GrpA",
    {
      id: 46,
      carmodel_id: 123,
      base_group_id: 23,
      subgroup_id: null,
    },
  ],
]);