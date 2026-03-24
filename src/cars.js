const BASE_GROUP_ID_TO_CLASS_NAME = {
  "10": "WRC 1.6",
  "11": "WRC 2.0",
  "21": "Group 2",
  "22": "Group 4",
  "23": "Group A5",
  "24": "Group A7",
  "30": "Group A8",
  "31": "Group B",
  "32": "Group N4",
  "33": "Group R1",
  "34": "Group R2",
  "35": "Group R3",
  "36": "Group R4",
  "37": "Group R5",
  "38": "Group RGT",
  "71": "Super 1600",
  "78": "Group A6",
  "104": "Rally 4",
  "108": "Rally 3",
  "111": "Super 2000",
  "118": "Rally 5",
  "125": "Rally 2",
};

const SUBGROUP_ID_TO_CLASS_NAME = {
  "10": "WRC 2013-2016",
  "11": "WRC 2017-2021",
  "21": "Group 4 (pre-1980)",
  "22": "Group 4 (1980-1986)",
  "23": "Group A5 (pre-1990)",
  "24": "Group A5 (1990-1996)",
  "25": "Group A7 (A7K)",
  "26": "Group A7 (A7)",
  "30": "Group A8 (pre-1990)",
  "31": "Group A8 (1990-1995)",
  "40": "Group B (B/09)",
  "41": "Group B (B/10)",
  "42": "Group B (B/12)",
  "50": "Group R2 (pre-2015)",
  "51": "Group R2 (2015-2020)",
  "60": "Group R3 (pre-2014)",
  "61": "Group R3 (2014)",
};

const CAR_LIST = [
  {
    "id": "91",
    "name": "Abarth Grande Punto S2000",
    "carmodel_id": "253",
    "base_group_id": "111",
    "subgroup_id": null
  },
  {
    "id": "83",
    "name": "Alpine A110 Rally RGT",
    "carmodel_id": "247",
    "base_group_id": "38",
    "subgroup_id": null
  },
  {
    "id": "62",
    "name": "Aston Martin Vantage RGT",
    "carmodel_id": "235",
    "base_group_id": "38",
    "subgroup_id": null
  },
  {
    "id": "72",
    "name": "Audi 200 quattro GrpA",
    "carmodel_id": "165",
    "base_group_id": "30",
    "subgroup_id": "30",
  },
  {
    "id": "66",
    "name": "Audi quattro A1 GrpB",
    "carmodel_id": "192",
    "base_group_id": "31",
    "subgroup_id": "42"
  },
  {
    "id": "67",
    "name": "Audi quattro A2 GrpB",
    "carmodel_id": "236",
    "base_group_id": "31",
    "subgroup_id": "42"
  },
  {
    "id": "18",
    "name": "Audi quattro Grp4",
    "carmodel_id": "204",
    "base_group_id": "22",
    "subgroup_id": "22"
  },
  {
    "id": "68",
    "name": "Audi Sport quattro GrpB",
    "carmodel_id": "131",
    "base_group_id": "31",
    "subgroup_id": "42"
  },
  {
    "id": "99",
    "name": "BMW M1 GrpB",
    "carmodel_id": "256",
    "base_group_id": "31",
    "subgroup_id": "42"
  },
  {
    "id": "87",
    "name": "BMW M3 E30 GrpA",
    "carmodel_id": "97",
    "base_group_id": "30",
    "subgroup_id": "31"
  },
  {
    "id": "89",
    "name": "BMW M3 E36 GrpA",
    "carmodel_id": "252",
    "base_group_id": "30",
    "subgroup_id": "31"
  },
  {
    "id": "54",
    "name": "Citroen C2 GT S1600",
    "carmodel_id": "44",
    "base_group_id": "71",
    "subgroup_id": null
  },
  {
    "id": "27",
    "name": "Citroen C2 R2 Max",
    "carmodel_id": "115",
    "base_group_id": "34",
    "subgroup_id": "50" 
  },
  {
    "id": "69",
    "name": "Citroen C3 R5",
    "carmodel_id": "212",
    "base_group_id": "37",
    "subgroup_id": null
  },
  {
    "id": "14",
    "name": "Citroen C3 WRC 2017",
    "carmodel_id": "191",
    "base_group_id": "10",
    "subgroup_id": "11"
  },
  {
    "id": "12",
    "name": "Citroen C4 WRC 2008",
    "carmodel_id": "257",
    "base_group_id": "11",
    "subgroup_id": null
  },
  {
    "id": "25",
    "name": "Citroen DS3 R1",
    "carmodel_id": "143",
    "base_group_id": "33",
    "subgroup_id": null
  },
  {
    "id": "32",
    "name": "Citroen DS3 R3-MAX",
    "carmodel_id": "118",
    "base_group_id": "35",
    "subgroup_id": "61"
  },
  {
    "id": "51",
    "name": "Citroen DS3 R5",
    "carmodel_id": "150",
    "base_group_id": "37",
    "subgroup_id": null
  },
  {
    "id": "8",
    "name": "Citroen DS3 WRC",
    "carmodel_id": "78",
    "base_group_id": "10",
    "subgroup_id": "10"
  },
  {
    "id": "94",
    "name": "Citroen Xsara Kit Car",
    "carmodel_id": "255",
    "base_group_id": "24",
    "subgroup_id": "25"
  },
  {
    "id": "13",
    "name": "Citroen Xsara WRC 2006",
    "carmodel_id": "18",
    "base_group_id": "11",
    "subgroup_id": null
  },
  {
    "id": "40",
    "name": "Fiat 124 Abarth Rally RGT",
    "carmodel_id": "213",
    "base_group_id": "38",
    "subgroup_id": null
  },
  {
    "id": "17",
    "name": "Fiat 126 Grp2",
    "carmodel_id": "200",
    "base_group_id": "21",
    "subgroup_id": null
  },
  {
    "id": "100",
    "name": "Fiat 131 Abarth Grp4",
    "carmodel_id": "258",
    "base_group_id": "22",
    "subgroup_id": "21"
  },
  {
    "id": "97",
    "name": "Fiat Abarth 500 R3T",
    "carmodel_id": "119",
    "base_group_id": "35",
    "subgroup_id": "60"
  },
  {
    "id": "78",
    "name": "Ford Escort Mk II RS Grp4",
    "carmodel_id": "241",
    "base_group_id": "22",
    "subgroup_id": "21"
  },
  {
    "id": "43",
    "name": "Ford Escort Mk V RS Cosworth Grp",
    "carmodel_id": "40",
    "base_group_id": "30",
    "subgroup_id": "31"
  },
  {
    "id": "92",
    "name": "Ford Fiesta Mk VI S2000",
    "carmodel_id": "68",
    "base_group_id": "111",
    "subgroup_id": null
  },
  {
    "id": "71",
    "name": "Ford Fiesta Mk VIII R2",
    "carmodel_id": "237",
    "base_group_id": "34",
    "subgroup_id": "51"
  },
  {
    "id": "28",
    "name": "Ford Fiesta R2",
    "carmodel_id": "228",
    "base_group_id": "34",
    "subgroup_id": "51"
  },
  {
    "id": "37",
    "name": "Ford Fiesta R5",
    "carmodel_id": "151",
    "base_group_id": "37",
    "subgroup_id": null
  },
  {
    "id": "81",
    "name": "Ford Fiesta Rally2",
    "carmodel_id": "262",
    "base_group_id": "125",
    "subgroup_id": null
  },
  {
    "id": "88",
    "name": "Ford Fiesta Rally3",
    "carmodel_id": "251",
    "base_group_id": "108",
    "subgroup_id": null
  },
  {
    "id": "109",
    "name": "Ford Fiesta rally3 evo",
    "carmodel_id": "266",
    "base_group_id": "108",
    "subgroup_id": null
  },
  {
    "id": "80",
    "name": "Ford Fiesta Rally4",
    "carmodel_id": "244",
    "base_group_id": "104",
    "subgroup_id": null

  },
  {
    "id": "9",
    "name": "Ford Fiesta RS WRC 2014",
    "carmodel_id": "157",
    "base_group_id": "10",
    "subgroup_id": "10"
  },
  {
    "id": "11",
    "name": "Ford Fiesta WRC 2019",
    "carmodel_id": "226",
    "base_group_id": "10",
    "subgroup_id": "11"
  },
  {
    "id": "55",
    "name": "Ford Focus Mk II RS WRC 2006",
    "carmodel_id": "17",
    "base_group_id": "11",
    "subgroup_id": null
  },
  {
    "id": "33",
    "name": "Honda Civic Type R(FN2) R3",
    "carmodel_id": "83",
    "base_group_id": "35",
    "subgroup_id": "60"
  },
  {
    "id": "15",
    "name": "Hyundai i20 Coupe WRC 2017",
    "carmodel_id": "188",
    "base_group_id": "10",
    "subgroup_id": "11"
  },
  {
    "id": "76",
    "name": "Hyundai i20 Coupe WRC 2020",
    "carmodel_id": "239",
    "base_group_id": "10",
    "subgroup_id": "11"
  },
  {
    "id": "104",
    "name": "Hyundai i20 Coupe WRC 2021",
    "carmodel_id": "261",
    "base_group_id": "10",
    "subgroup_id": "11"
  },
  {
    "id": "102",
    "name": "Hyundai i20 N Rally2",
    "carmodel_id": "259",
    "base_group_id": "125",
    "subgroup_id": null
  },
  {
    "id": "38",
    "name": "Hyundai i20 R5",
    "carmodel_id": "152",
    "base_group_id": "37",
    "subgroup_id": null
  },
  {
    "id": "60",
    "name": "Lada Kalina RC2 GrpA",
    "carmodel_id": "219",
    "base_group_id": "78",
    "subgroup_id": null
  },
  {
    "id": "41",
    "name": "Lada VFTS GrpB",
    "carmodel_id": "134",
    "base_group_id": "31",
    "subgroup_id": "41"
  },
  {
    "id": "73",
    "name": "Lancia Delta HF 4WD GrpA",
    "carmodel_id": "166",
    "base_group_id": "30",
    "subgroup_id": "30"
  },
  {
    "id": "84",
    "name": "Lancia Stratos HF Grp4",
    "carmodel_id": "248",
    "base_group_id": "22",
    "subgroup_id": "21"
  },
  {
    "id": "64",
    "name": "Lotus Exige S RGT",
    "carmodel_id": "184",
    "base_group_id": "38",
    "subgroup_id": null
  },
  {
    "id": "74",
    "name": "Mazda 323 BF 4WD Turbo GrpA",
    "carmodel_id": "169",
    "base_group_id": "30",
    "subgroup_id": "30"
  },
  {
    "id": "101",
    "name": "Mini JCW WRC",
    "carmodel_id": "160",
    "base_group_id": "10",
    "subgroup_id": "10"
  },
  {
    "id": "49",
    "name": "Mitsubishi Lancer Evo II GrpA",
    "carmodel_id": "173",
    "base_group_id": "30",
    "subgroup_id": "31"
  },
  {
    "id": "24",
    "name": "Mitsubishi Lancer Evo IX N4",
    "carmodel_id": "22",
    "base_group_id": "32",
    "subgroup_id": null
  },
  {
    "id": "48",
    "name": "Mitsubishi Lancer Evo IX R4",
    "carmodel_id": "22",
    "base_group_id": "36",
    "subgroup_id": null
  },
  {
    "id": "56",
    "name": "Mitsubishi Lancer Evo X R4",
    "carmodel_id": "163",
    "base_group_id": "36",
    "subgroup_id": null
  },
  {
    "id": "29",
    "name": "Opel ADAM R2",
    "carmodel_id": "145",
    "base_group_id": "34",
    "subgroup_id": "50"
  },
  {
    "id": "19",
    "name": "Opel Ascona 400 Grp4",
    "carmodel_id": "137",
    "base_group_id": "22",
    "subgroup_id": "22"
  },
  {
    "id": "65",
    "name": "Opel Manta 400 GrpB",
    "carmodel_id": "138",
    "base_group_id": "31",
    "subgroup_id": "42"
  },
  {
    "id": "86",
    "name": "Peugeot 106 Rallye S20 GrpA",
    "carmodel_id": "250",
    "base_group_id": "78",
    "subgroup_id": null
  },
  {
    "id": "70",
    "name": "Peugeot 205 T16 GrpB",
    "carmodel_id": "139",
    "base_group_id": "31",
    "subgroup_id": "42"
  },
  {
    "id": "90",
    "name": "Peugeot 207 S2000 Evolution Plus",
    "carmodel_id": "182",
    "base_group_id": "111",
    "subgroup_id": null
  },
  {
    "id": "30",
    "name": "Peugeot 208 R2",
    "carmodel_id": "229",
    "base_group_id": "34",
    "subgroup_id": "50"
  },
  {
    "id": "85",
    "name": "Peugeot 208 Rally4",
    "carmodel_id": "249",
    "base_group_id": "104",
    "subgroup_id": null
  },
  {
    "id": "103",
    "name": "Peugeot 208 T16 R5",
    "carmodel_id": "260",
    "base_group_id": "37",
    "subgroup_id": null
  },
  {
    "id": "95",
    "name": "Peugeot 306 Maxi Kit Car",
    "carmodel_id": "48",
    "base_group_id": "24",
    "subgroup_id": "25"
  },
  {
    "id": "63",
    "name": "Porsche 911 GT3 RS (2007) RGT",
    "carmodel_id": "186",
    "base_group_id": "38",
    "subgroup_id": null
  },
  {
    "id": "50",
    "name": "Porsche 911 GT3 RS (2010) RGT",
    "carmodel_id": "243",
    "base_group_id": "38",
    "subgroup_id": null
  },
  {
    "id": "52",
    "name": "Porsche 911 SC 3.0 Grp4",
    "carmodel_id": "209",
    "base_group_id": "22",
    "subgroup_id": "22"
  },
  {
    "id": "23",
    "name": "Porsche 911 SC RS GrpB",
    "carmodel_id": "141",
    "base_group_id": "31",
    "subgroup_id": "42"
  },
  {
    "id": "44",
    "name": "Renault 5 GT Turbo GrpA",
    "carmodel_id": "232",
    "base_group_id": "24",
    "subgroup_id": "26"
  },
  {
    "id": "21",
    "name": "Renault Clio 16S Williams GrpA",
    "carmodel_id": "88",
    "base_group_id": "24",
    "subgroup_id": "26"
  },
  {
    "id": "34",
    "name": "Renault Clio III R3",
    "carmodel_id": "47",
    "base_group_id": "35",
    "subgroup_id": "60"
  },
  {
    "id": "35",
    "name": "Renault Clio IV R3T",
    "carmodel_id": "189",
    "base_group_id": "35",
    "subgroup_id": "61"
  },
  {
    "id": "108",
    "name": "Renault Clio Rally3",
    "carmodel_id": "265",
    "base_group_id": "108",
    "subgroup_id": null
  },
  {
    "id": "93",
    "name": "Renault Clio Rally4",
    "carmodel_id": "254",
    "base_group_id": "104",
    "subgroup_id": null
  },
  {
    "id": "96",
    "name": "Renault Clio Rally5",
    "carmodel_id": "254",
    "base_group_id": "118",
    "subgroup_id": null
  },
  {
    "id": "26",
    "name": "Renault Twingo R1",
    "carmodel_id": "147",
    "base_group_id": "33",
    "subgroup_id": null
  },
  {
    "id": "31",
    "name": "Renault Twingo R2 Evo",
    "carmodel_id": "148",
    "base_group_id": "34",
    "subgroup_id": "50"
  },
  {
    "id": "79",
    "name": "Seat Leon Cupra R GrpN",
    "carmodel_id": "242",
    "base_group_id": "32",
    "subgroup_id": null
  },
  {
    "id": "61",
    "name": "Skoda 130 LR GrpB",
    "carmodel_id": "124",
    "base_group_id": "31",
    "subgroup_id": "40"
  },
  {
    "id": "58",
    "name": "Skoda 130 RS Grp2",
    "carmodel_id": "95",
    "base_group_id": "21",
    "subgroup_id": null
  },
  {
    "id": "39",
    "name": "Skoda Fabia R5",
    "carmodel_id": "225",
    "base_group_id": "37",
    "subgroup_id": null
  },
  {
    "id": "42",
    "name": "Skoda Fabia R5 evo",
    "carmodel_id": "231",
    "base_group_id": "37",
    "subgroup_id": null
  },
  {
    "id": "106",
    "name": "Skoda Fabia RS Rally2",
    "carmodel_id": "263",
    "base_group_id": "125",
    "subgroup_id": null
  },
  {
    "id": "98",
    "name": "Skoda Fabia S2000 Evo 2",
    "carmodel_id": "183",
    "base_group_id": "111",
    "subgroup_id": null
  },
  {
    "id": "82",
    "name": "Skoda Fabia WRC 2006",
    "carmodel_id": "246",
    "base_group_id": "11",
    "subgroup_id": null
  },
  {
    "id": "59",
    "name": "Skoda Favorit 136 L GrpA",
    "carmodel_id": "216",
    "base_group_id": "23",
    "subgroup_id": "24"
  },
  {
    "id": "22",
    "name": "Subaru Impreza GC8 555 GrpA",
    "carmodel_id": "55",
    "base_group_id": "30",
    "subgroup_id": "31"
  },
  {
    "id": "57",
    "name": "Subaru Impreza GDA WRC2003 (S9)",
    "carmodel_id": "105",
    "base_group_id": "11",
    "subgroup_id": null
  },
  {
    "id": "47",
    "name": "Subaru Impreza N14 N4",
    "carmodel_id": "230",
    "base_group_id": "32",
    "subgroup_id": null
  },
  {
    "id": "36",
    "name": "Subaru Impreza N15 R4",
    "carmodel_id": "230",
    "base_group_id": "36",
    "subgroup_id": null
  },
  {
    "id": "53",
    "name": "Toyota Celica 2000GT(ST185) GrpA",
    "carmodel_id": "234",
    "base_group_id": "30",
    "subgroup_id": "31"
  },
  {
    "id": "77",
    "name": "Toyota Celica TCT (TA64) GrpB",
    "carmodel_id": "240",
    "base_group_id": "31",
    "subgroup_id": "42"
  },
  {
    "id": "107",
    "name": "Toyota GR Yaris Rally2",
    "carmodel_id": "264",
    "base_group_id": "125",
    "subgroup_id": null
  },
  {
    "id": "16",
    "name": "Toyota Yaris WRC 2018",
    "carmodel_id": "227",
    "base_group_id": "10",
    "subgroup_id": "11"
  },
  {
    "id": "20",
    "name": "Trabant P 800 RS GrpA",
    "carmodel_id": "217",
    "base_group_id": "23",
    "subgroup_id": "23"
  },
  {
    "id": "105",
    "name": "Volvo 240 Turbo GrpA",
    "carmodel_id": "45",
    "base_group_id": "30",
    "subgroup_id": "30"
  },
  {
    "id": "75",
    "name": "VW Golf II GTI 16V GrpA",
    "carmodel_id": "238",
    "base_group_id": "24",
    "subgroup_id": "26"
  },
  {
    "id": "45",
    "name": "VW Polo GTI R5",
    "carmodel_id": "233",
    "base_group_id": "37",
    "subgroup_id": null
  },
  {
    "id": "10",
    "name": "VW Polo R WRC 2016",
    "carmodel_id": "162",
    "base_group_id": "10",
    "subgroup_id": "10"
  },
  {
    "id": "46",
    "name": "Wartburg 353 W 460 GrpA",
    "carmodel_id": "123",
    "base_group_id": "23",
    "subgroup_id": "23"
  }
]
