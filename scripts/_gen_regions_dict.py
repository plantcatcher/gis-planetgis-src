# -*- coding: utf-8 -*-
"""regions 家族（56 国）英译词典生成器。
数据来源：output/_regions_full.json（_extract_regions.py 导出）。
产出：scripts/i18n-maps-src/regions.json（被 gen-map-i18n.mjs 合并进 map-i18n.js）。

翻译约定：
- lead/popnote/src 允许含 <b> 标记（替换时走 innerHTML）；
- 中文键一律用渲染后的纯文本（<b> 等标签已剥离），与 map-i18n.js 的
  textContent 归一化匹配对齐；
-  facts / h1 / 总览按钮等短标签由 COUNTRIES 参数表 + 模板生成。
"""
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = json.load(open(os.path.join(ROOT, "output", "_regions_full.json"), encoding="utf-8"))

# ── 国家参数表：en=行文用名（带冠词），name=标题用名，l1/l2=一级/二级区划英文复数 ──
COUNTRIES = {
    "ARE": dict(en="the UAE", name="UAE", l1="emirates", l2="municipalities"),
    "ARG": dict(en="Argentina", name="Argentina", l1="provinces / autonomous city", l2="departments / partidos"),
    "AUS": dict(en="Australia", name="Australia", l1="states & territories", l2="local government areas"),
    "BRA": dict(en="Brazil", name="Brazil", l1="states / federal district", l2="municipalities"),
    "CAN": dict(en="Canada", name="Canada", l1="provinces / territories", l2="census divisions"),
    "CHE": dict(en="Switzerland", name="Switzerland", l1="cantons / half-cantons", l2="municipalities"),
    "CHL": dict(en="Chile", name="Chile", l1="regions", l2="provinces"),
    "COD": dict(en="DR Congo", name="DR Congo", l1="provinces", l2="territories / districts"),
    "COL": dict(en="Colombia", name="Colombia", l1="departments / capital district", l2="municipalities"),
    "DEU": dict(en="Germany", name="Germany", l1="federal states", l2="administrative districts"),
    "EGY": dict(en="Egypt", name="Egypt", l1="governorates", l2="markaz"),
    "ESP": dict(en="Spain", name="Spain", l1="autonomous communities", l2="provinces"),
    "ETH": dict(en="Ethiopia", name="Ethiopia", l1="regional states / chartered cities", l2="zones"),
    "FIN": dict(en="Finland", name="Finland", l1="provinces", l2="sub-regions"),
    "FRA": dict(en="France", name="France", l1="regions / overseas units", l2="departments"),
    "GHA": dict(en="Ghana", name="Ghana", l1="regions", l2="districts"),
    "GRC": dict(en="Greece", name="Greece", l1="decentralized administrations", l2="regions"),
    "IDN": dict(en="Indonesia", name="Indonesia", l1="provinces", l2="regencies / cities"),
    "IND": dict(en="India", name="India", l1="states / union territories", l2="districts"),
    "IRN": dict(en="Iran", name="Iran", l1="provinces", l2="counties"),
    "IRQ": dict(en="Iraq", name="Iraq", l1="governorates", l2="districts"),
    "ISR": dict(en="Israel", name="Israel", l1="districts", l2=""),
    "ITA": dict(en="Italy", name="Italy", l1="regions", l2="provinces / metropolitan cities"),
    "JOR": dict(en="Jordan", name="Jordan", l1="governorates", l2="districts"),
    "JPN": dict(en="Japan", name="Japan", l1="prefectures", l2="municipalities"),
    "KAZ": dict(en="Kazakhstan", name="Kazakhstan", l1="regions", l2="districts"),
    "KEN": dict(en="Kenya", name="Kenya", l1="counties", l2="sub-counties"),
    "KHM": dict(en="Cambodia", name="Cambodia", l1="provinces / capital municipality", l2="districts"),
    "KOR": dict(en="South Korea", name="South Korea", l1="province-level cities", l2="cities / counties / districts"),
    "LAO": dict(en="Laos", name="Laos", l1="provinces / capital / special zone", l2="districts"),
    "MAR": dict(en="Morocco", name="Morocco", l1="regions", l2="provinces / prefectures"),
    "MEX": dict(en="Mexico", name="Mexico", l1="states / federal entity", l2="municipalities"),
    "MMR": dict(en="Myanmar", name="Myanmar", l1="regions / states / union territory", l2="districts"),
    "MNG": dict(en="Mongolia", name="Mongolia", l1="provinces / capital", l2="sums"),
    "MYS": dict(en="Malaysia", name="Malaysia", l1="states / federal territories", l2="districts"),
    "NGA": dict(en="Nigeria", name="Nigeria", l1="states", l2="local government areas"),
    "NLD": dict(en="the Netherlands", name="Netherlands", l1="provinces", l2="municipalities"),
    "NPL": dict(en="Nepal", name="Nepal", l1="development regions", l2="districts"),
    "NZL": dict(en="New Zealand", name="New Zealand", l1="regions / territories", l2="territorial authorities"),
    "PAK": dict(en="Pakistan", name="Pakistan", l1="provinces / territories", l2="divisions"),
    "PHL": dict(en="the Philippines", name="Philippines", l1="provinces", l2="municipalities"),
    "PRK": dict(en="North Korea", name="North Korea", l1="provinces / special cities", l2="counties / cities"),
    "PRT": dict(en="Portugal", name="Portugal", l1="districts / autonomous regions", l2="municipalities"),
    "RUS": dict(en="Russia", name="Russia", l1="federal subjects", l2="districts / cities"),
    "SAU": dict(en="Saudi Arabia", name="Saudi Arabia", l1="provinces / regions", l2="sub-divisions"),
    "SGP": dict(en="Singapore", name="Singapore", l1="regions", l2=""),
    "SWE": dict(en="Sweden", name="Sweden", l1="counties", l2="municipalities"),
    "THA": dict(en="Thailand", name="Thailand", l1="provinces / metropolitan area", l2="districts"),
    "TUR": dict(en="Turkey", name="Turkey", l1="provinces", l2="districts"),
    "TZA": dict(en="Tanzania", name="Tanzania", l1="regions", l2="districts"),
    "UK": dict(en="the United Kingdom", name="United Kingdom", l1="constituent countries", l2=""),
    "UKR": dict(en="Ukraine", name="Ukraine", l1="oblast-level units", l2="raions / cities"),
    "USA": dict(en="the United States", name="United States", l1="states / federal district", l2="counties"),
    "UZB": dict(en="Uzbekistan", name="Uzbekistan", l1="regions / republic / city", l2="districts"),
    "VNM": dict(en="Vietnam", name="Vietnam", l1="provinces / municipalities", l2="districts / wards"),
    "ZAF": dict(en="South Africa", name="South Africa", l1="provinces", l2="districts / metros"),
}

# ── 手写翻译：ov=总览按钮 title=标题 lead=导语 pop=人口点评 desc=二级区划说明 src=数据来源 ──
HAND = {
    "are-regions": dict(
        ov="UAE Overview",
        title="UAE Administrative Divisions · Population, Area & Type of 7 Emirates",
        lead="A federal monarchy on the eastern tip of the Arabian Peninsula, made up of seven emirates. Oil and the skyscraper city of Dubai are its loudest labels. Click the map to see each emirate's Chinese name, capital, population, area and administrative type. The top bar switches shading between population, area and type — the darker the shade, the larger the value.",
        pop="Shaded by <b>population</b>: the Dubai and Abu Dhabi metro areas hold the vast majority of the country's people. The other five emirates cover far more land with far fewer residents.",
        desc="Municipalities are the basic administrative units below the emirates.",
        src="<b>Data source</b>: emirate and municipality boundaries from GADM 4.1 (gadm41_ARE_shp, WGS84 / EPSG:4326, open data). Areas are computed spherically from geometry (approximate). Administrative types come from GADM's ENGTYPE field. Population, capitals and Chinese names are manually compiled (approximate). This map shows administrative boundaries for illustration only; the way boundaries are drawn does not represent any position.",
    ),
    "arg-regions": dict(
        ov="Argentina Overview",
        title="Argentina Administrative Divisions · Population, Area & Type of 24 Provinces / Autonomous City",
        lead="A large country in southern South America: 23 provinces plus the autonomous city of Buenos Aires. The Pampas grasslands and the Patagonian steppe span a huge north–south range. Click the map to see each province / autonomous city's Chinese name, capital, population, area and administrative type. The top bar switches shading between population, area and type — the darker the shade, the larger the value.",
        pop="Shaded by <b>population</b>: Buenos Aires and the Pampas provinces around it are densely populated. The southern Patagonian provinces cover vast areas with very few people.",
        desc="Departments / partidos are the basic administrative units below the provinces / autonomous city.",
        src="<b>Data source</b>: province / autonomous city and department boundaries from GADM 4.1 (gadm41_ARG_shp, WGS84 / EPSG:4326, open data). Areas are computed spherically from geometry (approximate). Administrative types come from GADM's ENGTYPE field. Population, capitals and Chinese names are manually compiled (approximate). This map shows administrative boundaries for illustration only; the way boundaries are drawn does not represent any position.",
    ),
    "au-regions": dict(
        ov="Australia Overview",
        title="Australia Administrative Divisions · Population & Area of 6 States, 2 Territories & Overseas Territories",
        lead="Australia is a federation of 6 states and 2 territories, plus several overseas territories. Click the map to see each region's capital, population, area, year of joining the federation and highlights. The top bar switches shading between population and area — the darker the shade, the larger the value.",
        desc="",
        src="<b>Data source</b>: state / territory and local-government boundaries from GADM 4.1 (gadm41_AUS_shp, WGS84 / EPSG:4326, open data). Capitals, population (2021 census), area and year of federation are manually compiled; the figures follow the ABS and state governments and are approximate. Compliance: this map is a schematic of administrative divisions. National borders and overseas territories follow Australian official publications. The overseas territories (Ashmore and Cartier Islands, Coral Sea Islands, Jervis Bay) have very small or no permanent populations and are labelled separately.",
    ),
    "bra-regions": dict(
        ov="Brazil Overview",
        title="Brazil Administrative Divisions · Population, Area & Type of 27 States / Federal District",
        lead="The largest country in South America: 26 states plus 1 federal district. The Amazon rainforest covers the northern half. Click the map to see each state's Chinese name, capital, population, area and type.",
        pop="Shaded by <b>population</b>: São Paulo, Minas Gerais and Rio de Janeiro together hold close to 40% of the national population. The northern states of Amazonas and Roraima cover vast areas with very few people.",
        desc="Municipalities are the basic administrative units below the states.",
        src="<b>Data source</b>: state / federal district and municipality boundaries from GADM 4.1 (gadm41_BRA_shp, WGS84 / EPSG:4326, open data). Chinese names and capitals follow standard translations. Population is from the 2022 Brazilian census (approximate). Areas are computed spherically from geometry.",
    ),
    "can-regions": dict(
        ov="Canada Overview",
        title="Canada Administrative Divisions · Population, Area & Type of 13 Provinces / Territories",
        lead="The world's second-largest country by area: 10 provinces plus 3 territories. The three northern territories take up nearly 70% of the land. Click the map to see each province / territory's Chinese name, capital, population, area and type.",
        pop="Shaded by <b>population</b>: Ontario, Quebec and British Columbia hold close to three-quarters of the national population. Nunavut and the Northwest Territories cover vast areas with very few people.",
        desc="Census divisions are the basic administrative units below the provinces.",
        src="<b>Data source</b>: province / territory and census-division boundaries from GADM 4.1 (gadm41_CAN_shp, WGS84 / EPSG:4326, open data). Chinese names and capitals follow standard translations. Areas are computed spherically from geometry (approximate). Administrative types come from GADM's ENGTYPE field. Population and capitals are manually compiled (approximate). This map shows administrative boundaries for illustration only; the way boundaries are drawn does not represent any position.",
    ),
    "che-regions": dict(
        ov="Switzerland Overview",
        title="Switzerland Administrative Divisions · Population, Area & Type of 26 Cantons / Half-Cantons",
        lead="A federal country in the Alps with 26 cantons (including 6 half-cantons). Direct democracy and strong local autonomy are its most distinctive political traits. Click the map to see each canton / half-canton's Chinese name, capital, population, area and administrative type. The top bar switches shading between population, area and type — the darker the shade, the larger the value.",
        pop="Shaded by <b>population</b>: the central and western cantons of Zurich, Bern and Geneva are densely populated. The mountain cantons of Graubünden and Valais are much sparser.",
        desc="Municipalities are the basic administrative units below the cantons / half-cantons.",
        src="<b>Data source</b>: canton / half-canton and municipality boundaries from GADM 4.1 (gadm41_CHE_shp, WGS84 / EPSG:4326, open data). Areas are computed spherically from geometry (approximate). Administrative types come from GADM's ENGTYPE field. Population, capitals and Chinese names are manually compiled (approximate). This map shows administrative boundaries for illustration only; the way boundaries are drawn does not represent any position.",
    ),
    "chl-regions": dict(
        ov="Chile Overview",
        title="Chile Administrative Divisions · Population, Area & Type of 16 Regions",
        lead="A long, narrow country in southwestern South America with 16 regions (including the Santiago metropolitan region). The Andes, the Atacama Desert and the volcanic belt run the length of the country. Click the map to see each region's Chinese name, capital, population, area and administrative type. The top bar switches shading between population, area and type — the darker the shade, the larger the value.",
        pop="Shaded by <b>population</b>: the Santiago metropolitan region is extremely dense. The central valley regions come next. The northern Atacama Desert and southern Patagonia are almost empty.",
        desc="Provinces are the basic administrative units below the regions.",
        src="<b>Data source</b>: region and province boundaries from GADM 4.1 (gadm41_CHL_shp, WGS84 / EPSG:4326, open data). Areas are computed spherically from geometry (approximate). Administrative types come from GADM's ENGTYPE field. Population, capitals and Chinese names are manually compiled (approximate). This map shows administrative boundaries for illustration only; the way boundaries are drawn does not represent any position.",
    ),
    "cod-regions": dict(
        ov="DR Congo Overview",
        title="DR Congo Administrative Divisions · Population, Area & Type of 26 Provinces",
        lead="A giant country in central Africa with 26 provinces. The Congo Basin rainforest, mineral wealth (cobalt and copper) and a long inland waterway system define it. Click the map to see each province's Chinese name, capital, population, area and administrative type. The top bar switches shading between population, area and type — the darker the shade, the larger the value.",
        pop="Shaded by <b>population</b>: the city-province of Kinshasa and western provinces such as Bas-Congo are dense. The huge rainforest provinces in the east and north are sparsely populated.",
        desc="Territories / districts are the basic administrative units below the provinces.",
        src="<b>Data source</b>: province and territory / district boundaries from GADM 4.1 (gadm41_COD_shp, WGS84 / EPSG:4326, open data). Areas are computed spherically from geometry (approximate). Administrative types come from GADM's ENGTYPE field. Population, capitals and Chinese names are manually compiled (approximate). This map shows administrative boundaries for illustration only; the way boundaries are drawn does not represent any position.",
    ),
    "col-regions": dict(
        ov="Colombia Overview",
        title="Colombia Administrative Divisions · Population, Area & Type of 33 Departments / Capital District",
        lead="A country in northwestern South America: 32 departments plus the Bogotá capital district. Three Andean cordilleras, coffee, and the Caribbean coast define it. Click the map to see each department / capital district's Chinese name, capital, population, area and administrative type. The top bar switches shading between population, area and type — the darker the shade, the larger the value.",
        pop="Shaded by <b>population</b>: the Andean departments of Bogotá, Antioquia (Medellín) and Valle del Cauca (Cali) are dense. The Amazonian departments in the southeast are sparsely populated.",
        desc="Municipalities are the basic administrative units below the departments / capital district.",
        src="<b>Data source</b>: department / capital district and municipality boundaries from GADM 4.1 (gadm41_COL_shp, WGS84 / EPSG:4326, open data). Areas are computed spherically from geometry (approximate). Administrative types come from GADM's ENGTYPE field. Population, capitals and Chinese names are manually compiled (approximate). This map shows administrative boundaries for illustration only; the way boundaries are drawn does not represent any position.",
    ),
    "deu-regions": dict(
        ov="Germany Overview",
        title="Germany Administrative Divisions · Population, Area & Type of 16 Federal States",
        lead="A major federal country in central Europe with 16 federal states. Berlin, Hamburg and Bremen are city-states. Click the map to see each state's Chinese name, capital, population, area and type.",
        pop="Shaded by <b>population</b>: North Rhine-Westphalia, Bavaria and Baden-Württemberg have the largest populations. North Rhine-Westphalia alone exceeds 17 million.",
        desc="Administrative districts are the basic administrative units below the states.",
        src="<b>Data source</b>: state and district boundaries from GADM 4.1 (gadm41_DEU_shp, WGS84 / EPSG:4326, open data). Chinese names and capitals follow standard translations. Areas are computed spherically from geometry (approximate). Administrative types come from GADM's ENGTYPE field. Population and capitals are manually compiled (approximate). This map shows administrative boundaries for illustration only; the way boundaries are drawn does not represent any position.",
    ),
    "egy-regions": dict(
        ov="Egypt Overview",
        title="Egypt Administrative Divisions · Population, Area & Highlights of 27 Governorates and 343 Districts",
        lead="Egypt is made up of 27 governorates (Muhafazah), divided into more than 340 districts. The country covers nearly 1 million km², yet over 95% of its people crowd into the Nile valley and delta. Click the map to see each governorate's Chinese name, capital, population, area and highlights. The top bar switches shading between population, area and region.",
        pop="Shaded by <b>population</b>. The three Greater Cairo governorates (Cairo, Giza, Qalyubia) hold about 25 million people — the largest metropolitan area in Africa and the Arab world.",
        desc="A district (Markaz, مركز) is the basic administrative unit below an Egyptian governorate. There are more than 340 nationwide, each covering several towns and rural centres.",
        src="<b>Data source</b>: governorate and district boundaries from GADM 4.1 (gadm41_EGY_shp, WGS84 / EPSG:4326, open data). Chinese names follow standard translations. Population, capitals and areas are manually compiled (approximate). This map shows administrative boundaries for illustration only; the way boundaries are drawn does not represent any position.",
    ),
    "esp-regions": dict(
        ov="Spain Overview",
        title="Spain Administrative Divisions · Population, Area & Highlights of 18 Autonomous Communities and 52 Provinces",
        lead="Spain consists of 17 autonomous communities plus 2 autonomous cities, making it one of Europe's most decentralised countries. Each community is further divided into 52 provinces. Click the map to see each community's Chinese name, capital, population, area and highlights. The top bar switches shading between population, area and region.",
        pop="Shaded by <b>population</b>. Andalusia and Catalonia have the largest populations, and Madrid makes the top three on the strength of a single city.",
        desc="A province (Provincia) is the traditional division below an autonomous community. Spain has 52 provinces in total; the two autonomous cities of Ceuta and Melilla have no province.",
        src="<b>Data source</b>: autonomous-community and province boundaries from GADM 4.1 (gadm41_ESP_shp, WGS84 / EPSG:4326, open data). Chinese names follow standard translations. Population, capitals and areas are manually compiled (approximate). This map shows administrative boundaries for illustration only; the way boundaries are drawn does not represent any position.",
    ),
    "eth-regions": dict(
        ov="Ethiopia Overview",
        title="Ethiopia Administrative Divisions · Population, Area & Type of 11 Regional States / Chartered Cities",
        lead="A highland country in East Africa — the only African nation never colonised for long. Its 11 regional states and 2 chartered cities are drawn along ethnic and linguistic lines. Ethiopia is the birthplace of coffee, and the rock-hewn churches of Lalibela stand here. Click the map to see each regional state / chartered city's Chinese name, capital, population, area and administrative type. The top bar switches shading between population, area and type — the darker the shade, the larger the value.",
        pop="Shaded by <b>population</b>: the two highland states of Oromia and Amhara have the largest populations. The capital Addis Ababa is the smallest by area but the densest. The Somali region in the southeast and the southwestern lowlands are clearly sparser.",
        desc="Zones are the basic administrative units below the regional states / chartered cities.",
        src="<b>Data source</b>: regional-state / chartered-city and zone boundaries from GADM 4.1 (gadm41_ETH_shp, WGS84 / EPSG:4326, open data). Areas are computed spherically from geometry (approximate). Administrative types come from GADM's ENGTYPE field. Population, capitals and Chinese names are manually compiled (approximate). This map shows administrative boundaries for illustration only; the way boundaries are drawn does not represent any position.",
    ),
    "fin-regions": dict(
        ov="Finland Overview",
        title="Finland Administrative Divisions · Population, Area & Type of 5 Provinces",
        lead="A Nordic country on the Baltic Sea. Its 5 first-level provinces follow the 1997–2009 division. Finland is dotted with lakes, has harsh winters, and is known for Santa Claus and the northern lights. Click the map to see each province's Chinese name, capital, population, area and administrative type. The top bar switches shading between population, area and type — the darker the shade, the larger the value.",
        pop="Shaded by <b>population</b>: Uusimaa, where Helsinki sits, dominates. Lapland in the north covers a vast area with very few people.",
        desc="Sub-regions are the basic administrative units below the provinces.",
        src="<b>Data source</b>: province and sub-region boundaries from GADM 4.1 (gadm41_FIN_shp, WGS84 / EPSG:4326, open data). Areas are computed spherically from geometry (approximate). Administrative types come from GADM's ENGTYPE field. Population, capitals and Chinese names are manually compiled (approximate). This map shows administrative boundaries for illustration only; the way boundaries are drawn does not represent any position.",
    ),
    "fra-regions": dict(
        ov="France Overview",
        title="France Administrative Divisions · Population, Area & Type of 13 Regions / Overseas Units",
        lead="A core country of Western Europe with 13 metropolitan regions plus several overseas units. Central authority and regional government coexist. Click the map to see each region / overseas unit's Chinese name, capital, population, area and administrative type. The top bar switches shading between population, area and type — the darker the shade, the larger the value.",
        pop="Shaded by <b>population</b>: Île-de-France (Paris) stands alone. The metro areas of Lyon and Marseille come next. The southwestern and central rural regions are sparse.",
        desc="Departments are the basic administrative units below the regions / overseas units.",
        src="<b>Data source</b>: region / overseas unit and department boundaries from GADM 4.1 (gadm41_FRA_shp, WGS84 / EPSG:4326, open data). Areas are computed spherically from geometry (approximate). Administrative types come from GADM's ENGTYPE field. Population, capitals and Chinese names are manually compiled (approximate). This map shows administrative boundaries for illustration only; the way boundaries are drawn does not represent any position.",
    ),
    "gha-regions": dict(
        ov="Ghana Overview",
        title="Ghana Administrative Divisions · Population, Area & Type of 16 Regions",
        lead="A stable coastal country in West Africa with 16 regions. Gold, cocoa, Lake Volta and the Accra capital area define it. Click the map to see each region's Chinese name, capital, population, area and administrative type. The top bar switches shading between population, area and type — the darker the shade, the larger the value.",
        pop="Shaded by <b>population</b>: Greater Accra and Ashanti (Kumasi) in the south are dense. The northern regions are relatively sparse.",
        desc="Districts are the basic administrative units below the regions.",
        src="<b>Data source</b>: region and district boundaries from GADM 4.1 (gadm41_GHA_shp, WGS84 / EPSG:4326, open data). Areas are computed spherically from geometry (approximate). Administrative types come from GADM's ENGTYPE field. Population, capitals and Chinese names are manually compiled (approximate). This map shows administrative boundaries for illustration only; the way boundaries are drawn does not represent any position.",
    ),
    "grc-regions": dict(
        ov="Greece Overview",
        title="Greece Administrative Divisions · Population, Area & Type of 8 Decentralized Administrations",
        lead="A peninsula country on the southern Balkans, on the Aegean Sea. Its 8 decentralized administrations oversee 14 regions. Greece is the birthplace of Western civilisation and a meeting point of East Mediterranean geography and tourism. Click the map to see each administration's Chinese name, capital, population, area and administrative type. The top bar switches shading between population, area and type — the darker the shade, the larger the value.",
        pop="Shaded by <b>population</b>: the Attica administration (Athens) is extremely dense. The Aegean islands and the Peloponnese are clearly sparser.",
        desc="Regions are the basic administrative units below the decentralized administrations.",
        src="<b>Data source</b>: administration and region boundaries from GADM 4.1 (gadm41_GRC_shp, WGS84 / EPSG:4326, open data). Areas are computed spherically from geometry (approximate). Administrative types come from GADM's ENGTYPE field. Population, capitals and Chinese names are manually compiled (approximate). This map shows administrative boundaries for illustration only; the way boundaries are drawn does not represent any position.",
    ),
    "idn-regions": dict(
        ov="Indonesia Overview",
        title="Indonesia Administrative Divisions · Population, Area & Type of 34 Provinces",
        lead="The world's largest archipelago: more than 17,000 islands straddling the equator. Its 34 provinces run from Sumatra to the western half of New Guinea. With 280 million people it has the largest population in Southeast Asia. Click the map to see each province's Chinese name, capital, population, area and administrative type. The top bar switches shading between population, area and type — the darker the shade, the larger the value.",
        pop="Shaded by <b>population</b>: the Javanese provinces of West, East and Central Java are overwhelmingly dense. The provinces of Kalimantan and Papua cover vast areas with very few people.",
        desc="Regencies / cities are the basic administrative units below the provinces.",
        src="<b>Data source</b>: province and regency / city boundaries from GADM 4.1 (gadm41_IDN_shp, WGS84 / EPSG:4326, open data). Areas are computed spherically from geometry (approximate). Administrative types come from GADM's ENGTYPE field. Population, capitals and Chinese names are manually compiled (approximate). This map shows administrative boundaries for illustration only; the way boundaries are drawn does not represent any position.",
    ),
    "ind-regions": dict(
        ov="India Overview",
        title="India Administrative Divisions · Population, Area & Type of 35 States / Union Territories",
        lead="The main country of the South Asian subcontinent, made up of states and union territories. With 1.4 billion people it has the world's largest population. The Ganges plain and the Deccan Plateau form its geographic backbone. Click the map to see each state / union territory's Chinese name, capital, population, area and administrative type. The top bar switches shading between population, area and type — the darker the shade, the larger the value.",
        pop="Shaded by <b>population</b>: the Ganges–Indus states of Uttar Pradesh, Maharashtra and Bihar are extremely dense. The hill states of the northeast and the island union territories are clearly sparser.",
        desc="Districts are the basic administrative units below the states / union territories.",
        src="<b>Data source</b>: state / union territory and district boundaries from GADM 4.1 (gadm41_IND_shp, WGS84 / EPSG:4326, open data). Areas are computed spherically from geometry (approximate). Administrative types come from GADM's ENGTYPE field. Population, capitals and Chinese names are manually compiled (approximate). This map shows administrative boundaries for illustration only; the way boundaries are drawn does not represent any position.",
    ),
    "irn-regions": dict(
        ov="Iran Overview",
        title="Iran Administrative Divisions · Population, Area & Type of 31 Provinces",
        lead="A large highland country in West Asia with 31 provinces. Persian civilisation and Shia Islam meet here. The Zagros and Alborz mountains frame a central plateau. Oil, carpets and twin coastlines on the Caspian and the Persian Gulf are its geographic labels. Click the map to see each province's Chinese name, capital, population, area and administrative type. The top bar switches shading between population, area and type — the darker the shade, the larger the value.",
        pop="Shaded by <b>population</b>: Tehran province stands alone, with a metro area of ten million. Isfahan, Fars and Razavi Khorasan come next. Sistan and Baluchestan in the southeast and the central desert provinces are sparse.",
        desc="Counties are the basic administrative units below the provinces.",
        src="<b>Data source</b>: province and county boundaries from GADM 4.1 (gadm41_IRN_shp, WGS84 / EPSG:4326, open data). Areas are computed spherically from geometry (approximate). Administrative types come from GADM's ENGTYPE field. Population, capitals and Chinese names are manually compiled (approximate). This map shows administrative boundaries for illustration only; the way boundaries are drawn does not represent any position.",
    ),
    "irq-regions": dict(
        ov="Iraq Overview",
        title="Iraq Administrative Divisions · Population, Area & Type of 18 Governorates",
        lead="The birthplace of civilisation in the land of the two rivers (Mesopotamia), with 18 governorates. The Tigris and Euphrates merge into the Shatt al-Arab in the south. Oil reserves and the millennia-old city of Baghdad are its heaviest labels. Click the map to see each governorate's Chinese name, capital, population, area and administrative type. The top bar switches shading between population, area and type — the darker the shade, the larger the value.",
        pop="Shaded by <b>population</b>: Baghdad governorate stands alone. Basra and Nineveh (Mosul) come next. Anbar in the west is the largest by area but sparsely populated.",
        desc="Districts are the basic administrative units below the governorates.",
        src="<b>Data source</b>: governorate and district boundaries from GADM 4.1 (gadm41_IRQ_shp, WGS84 / EPSG:4326, open data). Areas are computed spherically from geometry (approximate). Administrative types come from GADM's ENGTYPE field. Population, capitals and Chinese names are manually compiled (approximate). This map shows administrative boundaries for illustration only; the way boundaries are drawn does not represent any position.",
    ),
    "isr-regions": dict(
        ov="Israel Overview",
        title="Israel Administrative Divisions · Population, Area & Type of 7 Districts",
        lead="A narrow country on the eastern Mediterranean with 7 districts. Holy cities and high-tech industry meet here. Click the map to see each district's Chinese name, capital, population, area and administrative type. The top bar switches shading between population, area and type — the darker the shade, the larger the value.",
        pop="Shaded by <b>population</b>: Tel Aviv and the Central District are densely populated. The Negev desert district in the south is extremely sparse.",
        desc="There is no second administrative level below the districts.",
        src="<b>Data source</b>: district boundaries from GADM 4.1 (gadm41_ISR_shp, WGS84 / EPSG:4326, open data). Areas are computed spherically from geometry (approximate). Administrative types come from GADM's ENGTYPE field. Population, capitals and Chinese names are manually compiled (approximate). This map shows administrative boundaries for illustration only; the way boundaries are drawn does not represent any position.",
    ),
    "ita-regions": dict(
        ov="Italy Overview",
        title="Italy Administrative Divisions · Population, Area & Type of 20 Regions",
        lead="A boot-shaped peninsula country in southern Europe with 20 regions: the Alps in the north, historic cities in the centre, the Mediterranean in the south. Culture and manufacturing carry equal weight. Click the map to see each region's Chinese name, capital, population, area and administrative type. The top bar switches shading between population, area and type — the darker the shade, the larger the value.",
        pop="Shaded by <b>population</b>: the northern and central regions of Lombardy (Milan) and Lazio (Rome) are dense. Basilicata and Molise in the south are sparser.",
        desc="Provinces / metropolitan cities are the basic administrative units below the regions.",
        src="<b>Data source</b>: region and province / metropolitan-city boundaries from GADM 4.1 (gadm41_ITA_shp, WGS84 / EPSG:4326, open data). Areas are computed spherically from geometry (approximate). Administrative types come from GADM's ENGTYPE field. Population, capitals and Chinese names are manually compiled (approximate). This map shows administrative boundaries for illustration only; the way boundaries are drawn does not represent any position.",
    ),
    "jor-regions": dict(
        ov="Jordan Overview",
        title="Jordan Administrative Divisions · Population, Area & Type of 12 Governorates",
        lead="A stable kingdom in the Middle East guarding the Jordan River and the Gulf of Aqaba. Its 12 governorates include Petra, the Dead Sea and the focal point of refugee geopolitics. Click the map to see each governorate's Chinese name, capital, population, area and administrative type. The top bar switches shading between population, area and type — the darker the shade, the larger the value.",
        pop="Shaded by <b>population</b>: the northwestern governorates of Amman and Irbid are dense. The southern and eastern desert governorates (Ma'an and the Aqaba area) are sparsely populated.",
        desc="Districts are the basic administrative units below the governorates.",
        src="<b>Data source</b>: governorate and district boundaries from GADM 4.1 (gadm41_JOR_shp, WGS84 / EPSG:4326, open data). Areas are computed spherically from geometry (approximate). Administrative types come from GADM's ENGTYPE field. Population, capitals and Chinese names are manually compiled (approximate). This map shows administrative boundaries for illustration only; the way boundaries are drawn does not represent any position.",
    ),
    "jp-regions": dict(
        ov="Japan Overview",
        title="Japan Administrative Divisions · Population, Area & Highlights of 47 Prefectures and 8 Regions",
        lead="Japan consists of 47 first-level units (to-dō-fu-ken), divided into 1,811 municipalities. Traditionally they are also grouped into 8 geographic and historic regions. Click the map to see each prefecture's kanji name, type, parent region, capital, population, area and highlights. The top bar switches shading between population, area and region.",
        desc="",
        src="<b>Data source</b>: prefecture and municipality boundaries from GADM 4.1 (gadm41_JPN_shp, WGS84 / EPSG:4326, open data). Kanji names come from GADM's local-name field (NL_NAME_1). Population is from the 2020 Statistics Bureau census; areas are approximate. For quick reference only. Japan's divisions are 1 metropolis (Tokyo) · 1 dō (Hokkaido) · 2 fu (Kyoto, Osaka) · 43 prefectures, grouped into 8 regions.",
    ),
    "kaz-regions": dict(
        ov="Kazakhstan Overview",
        title="Kazakhstan Administrative Divisions · Population, Area & Type of 14 Regions",
        lead="The world's largest landlocked country, with 14 regions running from the Caspian Sea to the Altai Mountains. Steppe, desert and the Baikonur Cosmodrome make up its vastness, and it is a key corridor of the Belt and Road Initiative. Click the map to see each region's Chinese name, capital, population, area and administrative type. The top bar switches shading between population, area and type — the darker the shade, the larger the value.",
        pop="Shaded by <b>population</b>: Almaty and Turkistan (Shymkent) in the south are densely populated. The huge steppe and desert regions of the north and centre are sparsely populated.",
        desc="Districts are the basic administrative units below the regions.",
        src="<b>Data source</b>: region and district boundaries from GADM 4.1 (gadm41_KAZ_shp, WGS84 / EPSG:4326, open data). Areas are computed spherically from geometry (approximate). Administrative types come from GADM's ENGTYPE field. Population, capitals and Chinese names are manually compiled (approximate). This map shows administrative boundaries for illustration only; the way boundaries are drawn does not represent any position.",
    ),
    "ken-regions": dict(
        ov="Kenya Overview",
        title="Kenya Administrative Divisions · Population, Area & Type of 47 Counties",
        lead="A hub country in East Africa with 47 counties. The equator crosses it, along with the Mombasa–Nairobi railway and the Great Rift Valley. Nairobi is the regional centre. Click the map to see each county's Chinese name, capital, population, area and administrative type. The top bar switches shading between population, area and type — the darker the shade, the larger the value.",
        pop="Shaded by <b>population</b>: the central highland counties of Nairobi and Kiambu are dense. The arid counties of the northeast and north are extremely sparse.",
        desc="Sub-counties are the basic administrative units below the counties.",
        src="<b>Data source</b>: county and sub-county boundaries from GADM 4.1 (gadm41_KEN_shp, WGS84 / EPSG:4326, open data). Areas are computed spherically from geometry (approximate). Administrative types come from GADM's ENGTYPE field. Population, capitals and Chinese names are manually compiled (approximate). This map shows administrative boundaries for illustration only; the way boundaries are drawn does not represent any position.",
    ),
    "khm-regions": dict(
        ov="Cambodia Overview",
        title="Cambodia Administrative Divisions · Population, Area & Type of 24 Provinces / Capital Municipality",
        lead="A kingdom in the southern Indochinese Peninsula: 24 provinces plus the Phnom Penh capital municipality. The Angkor monuments and Mekong delta agriculture define it. Click the map to see each province / municipality's Chinese name, capital, population, area and administrative type. The top bar switches shading between population, area and type — the darker the shade, the larger the value.",
        pop="Shaded by <b>population</b>: Phnom Penh and the Mekong delta provinces of Kandal and Kampong Cham are dense. The northern and western hill provinces are sparse.",
        desc="Districts are the basic administrative units below the provinces / capital municipality.",
        src="<b>Data source</b>: province / municipality and district boundaries from GADM 4.1 (gadm41_KHM_shp, WGS84 / EPSG:4326, open data). Areas are computed spherically from geometry (approximate). Administrative types come from GADM's ENGTYPE field. Population, capitals and Chinese names are manually compiled (approximate). This map shows administrative boundaries for illustration only; the way boundaries are drawn does not represent any position.",
    ),
    "kor-regions": dict(
        ov="South Korea Overview",
        title="South Korea Administrative Divisions · Population, Area & Highlights of 17 Province-Level Cities and 229 Lower Units",
        lead="South Korea is made up of 17 province-level units: 1 special city (Seoul) · 6 metropolitan cities · 1 special self-governing city (Sejong) · 1 special self-governing province (Jeju) · 8 provinces. Half the population crowds into the capital region, while North Gyeongsang has the largest area. Click the map to see each province-level city's Chinese translation, hanja name, population, area and highlights.",
        pop="Shaded by <b>population</b>. Gyeonggi alone has about 13.6 million people. Together with Seoul and Incheon it forms the capital region — half the national population.",
        desc="Cities (si), counties (gun) and districts (gu) are the basic administrative units below a province-level city: metropolitan cities and some cities have districts, while counties mostly govern rural towns and villages.",
        src="<b>Data source</b>: province-level and city / county / district boundaries from GADM 4.1 (gadm41_KOR_shp, WGS84 / EPSG:4326, open data). Hanja names come from GADM's local-name field (NL_NAME_1, e.g. 「釜山廣域市」). Chinese translations follow standard usage. Population is from resident-registration estimates (approximate); areas are computed from geometry. For quick reference only. Korea's divisions are 17 province-level units → 229 cities / counties / districts.",
    ),
    "lao-regions": dict(
        ov="Laos Overview",
        title="Laos Administrative Divisions · Population, Area & Type of 18 First-Level Units",
        lead="A landlocked country in the Indochinese Peninsula. The China–Laos railway gives the landlocked nation access to the sea. Its 18 first-level units (16 provinces + Vientiane capital + Xaisomboun special zone) are strung along the Mekong, with mountains and a tropical monsoon climate. Click the map to see each province / capital / special zone's Chinese name, capital, population, area and administrative type. The top bar switches shading between population, area and type — the darker the shade, the larger the value.",
        pop="Shaded by <b>population</b>: Vientiane capital and the Mekong provinces of Savannakhet and Champasak are dense. The northern mountain provinces of Phongsali and Hua Phan are clearly sparser.",
        desc="Districts are the basic administrative units below the provinces / capital / special zone.",
        src="<b>Data source</b>: province / capital / special-zone and district boundaries from GADM 4.1 (gadm41_LAO_shp, WGS84 / EPSG:4326, open data). Areas are computed spherically from geometry (approximate). Administrative types come from GADM's ENGTYPE field. Population, capitals and Chinese names are manually compiled (approximate). This map shows administrative boundaries for illustration only; the way boundaries are drawn does not represent any position.",
    ),
    "mar-regions": dict(
        ov="Morocco Overview",
        title="Morocco Administrative Divisions · Population, Area & Type of 12 Regions",
        lead="A country at the northwestern corner of Africa guarding the Strait of Gibraltar, with 12 regions. The Atlas Mountains, the edge of the Sahara and phosphates define it. Click the map to see each region's Chinese name, capital, population, area and administrative type. The top bar switches shading between population, area and type — the darker the shade, the larger the value.",
        pop="Shaded by <b>population</b>: the Casablanca–Rabat coastal region is dense. The southern and eastern Saharan regions are extremely sparse.",
        desc="Provinces / prefectures are the basic administrative units below the regions.",
        src="<b>Data source</b>: region and province / prefecture boundaries from GADM 4.1 (gadm41_MAR_shp, WGS84 / EPSG:4326, open data). Areas are computed spherically from geometry (approximate). Administrative types come from GADM's ENGTYPE field. Population, capitals and Chinese names are manually compiled (approximate). This map shows administrative boundaries for illustration only; the way boundaries are drawn does not represent any position.",
    ),
    "mex-regions": dict(
        ov="Mexico Overview",
        title="Mexico Administrative Divisions · Population, Area & Type of 31 States / Federal Entity",
        lead="A large country in southern North America: 31 states plus the Mexico City federal entity. It links North and South America and balances nearshoring with cultural tourism. Click the map to see each state / federal entity's Chinese name, capital, population, area and administrative type. The top bar switches shading between population, area and type — the darker the shade, the larger the value.",
        pop="Shaded by <b>population</b>: the metro areas of Mexico City, Jalisco (Guadalajara) and Nuevo León (Monterrey) are dense. The northern desert states and southern Oaxaca are sparser.",
        desc="Municipalities are the basic administrative units below the states / federal entity.",
        src="<b>Data source</b>: state / federal entity and municipality boundaries from GADM 4.1 (gadm41_MEX_shp, WGS84 / EPSG:4326, open data). Areas are computed spherically from geometry (approximate). Administrative types come from GADM's ENGTYPE field. Population, capitals and Chinese names are manually compiled (approximate). This map shows administrative boundaries for illustration only; the way boundaries are drawn does not represent any position.",
    ),
    "mmr-regions": dict(
        ov="Myanmar Overview",
        title="Myanmar Administrative Divisions · Population, Area & Type of 7 Regions, 7 States & Union Territory",
        lead="A country in the western Indochinese Peninsula: 7 regions, 7 states and the Naypyidaw union territory. Its ethnic diversity and the Irrawaddy River running its length define it. Click the map to see each region / state / union territory's Chinese name, capital, population, area and administrative type. The top bar switches shading between population, area and type — the darker the shade, the larger the value.",
        pop="Shaded by <b>population</b>: the central regions of Yangon and Mandalay are dense. The northern Kachin and eastern Shan hill states are sparsely populated.",
        desc="Districts are the basic administrative units below the regions / states / union territory.",
        src="<b>Data source</b>: region / state / union-territory and district boundaries from GADM 4.1 (gadm41_MMR_shp, WGS84 / EPSG:4326, open data). Areas are computed spherically from geometry (approximate). Administrative types come from GADM's ENGTYPE field. Population, capitals and Chinese names are manually compiled (approximate). This map shows administrative boundaries for illustration only; the way boundaries are drawn does not represent any position.",
    ),
    "mng-regions": dict(
        ov="Mongolia Overview",
        title="Mongolia Administrative Divisions · Population, Area & Highlights of 21 Provinces and Capital",
        lead="Mongolia consists of 21 provinces (aimag) plus the capital Ulaanbaatar, divided into more than 330 sums. On average each sum has fewer than 1,000 people, making them among the sparsest grassroots divisions in the world. Click the map to see each province / capital's Chinese translation, provincial capital, population, area and highlights.",
        pop="Shaded by <b>population</b>. Ulaanbaatar alone holds about half the national population; the Gobi provinces are vast but sparsely populated.",
        desc="A sum (сум) is the basic administrative unit below a Mongolian province. There are more than 330 nationwide, each averaging fewer than 1,000 people — among the sparsest grassroots divisions in the world.",
        src="<b>Data source</b>: province / capital and sum boundaries from GADM 4.1 (gadm41_MNG_shp, WGS84 / EPSG:4326, open data). Chinese translations follow standard usage. Population is from recent censuses / official estimates (approximate); areas are computed from geometry. For quick reference only.",
    ),
    "mys-regions": dict(
        ov="Malaysia Overview",
        title="Malaysia Administrative Divisions · Population, Area & Type of 13 States / Federal Territories",
        lead="A Southeast Asian country split in two by the South China Sea: 13 states plus 3 federal territories. Peninsular urban belts face the Borneo rainforests across the sea, and the Strait of Malacca is one of the world's busiest shipping lanes. Click the map to see each state / federal territory's Chinese name, capital, population, area and administrative type. The top bar switches shading between population, area and type — the darker the shade, the larger the value.",
        pop="Shaded by <b>population</b>: Selangor (including the Kuala Lumpur metro area) and Johor (next to Singapore) are the densest. Sabah and Sarawak in East Malaysia are vast but thinly populated.",
        desc="Districts are the basic administrative units below the states / federal territories.",
        src="<b>Data source</b>: state / federal-territory and district boundaries from GADM 4.1 (gadm41_MYS_shp, WGS84 / EPSG:4326, open data). Areas are computed spherically from geometry (approximate). Administrative types come from GADM's ENGTYPE field. Population, capitals and Chinese names are manually compiled (approximate). This map shows administrative boundaries for illustration only; the way boundaries are drawn does not represent any position.",
    ),
    "nga-regions": dict(
        ov="Nigeria Overview",
        title="Nigeria Administrative Divisions · Population, Area & Type of 37 States",
        lead="Africa's most populous country, with 37 states (including the federal capital territory). Niger delta oil, the mega-city of Lagos and the Muslim–Christian divide between north and south make up this African giant. Click the map to see each state's Chinese name, capital, population, area and administrative type. The top bar switches shading between population, area and type — the darker the shade, the larger the value.",
        pop="Shaded by <b>population</b>: Lagos has astonishing density (Africa's largest city). Kano, the northern trading capital, comes next. The central and northeastern states are thinly spread.",
        desc="Local government areas are the basic administrative units below the states.",
        src="<b>Data source</b>: state and local-government boundaries from GADM 4.1 (gadm41_NGA_shp, WGS84 / EPSG:4326, open data). Areas are computed spherically from geometry (approximate). Administrative types come from GADM's ENGTYPE field. Population, capitals and Chinese names are manually compiled (approximate). This map shows administrative boundaries for illustration only; the way boundaries are drawn does not represent any position.",
    ),
    "nld-regions": dict(
        ov="Netherlands Overview",
        title="Netherlands Administrative Divisions · Population, Area & Type of 12 Provinces",
        lead="A lowland country with 12 provinces that reclaims land from the sea with polders and dikes. Amsterdam and Rotterdam are Europe's gateways. Click the map to see each province's Chinese name, capital, population, area and administrative type. The top bar switches shading between population, area and type — the darker the shade, the larger the value.",
        pop="Shaded by <b>population</b>: the western provinces of South Holland, North Holland and Utrecht are densely populated. Friesland and other northeastern provinces are far gentler.",
        desc="Municipalities are the basic administrative units below the provinces.",
        src="<b>Data source</b>: province and municipality boundaries from GADM 4.1 (gadm41_NLD_shp, WGS84 / EPSG:4326, open data). Areas are computed spherically from geometry (approximate). Administrative types come from GADM's ENGTYPE field. Population, capitals and Chinese names are manually compiled (approximate). This map shows administrative boundaries for illustration only; the way boundaries are drawn does not represent any position.",
    ),
    "npl-regions": dict(
        ov="Nepal Overview",
        title="Nepal Administrative Divisions · Population, Area & Type of 5 Development Regions",
        lead="A mountain country on the southern slopes of the Himalayas, bordering China. GADM 4.1 keeps the pre-2015 framework: 5 development regions overseeing 14 districts. Everest and trekking paradises are here. Click the map to see each development region's Chinese name, capital, population, area and administrative type. The top bar switches shading between population, area and type — the darker the shade, the larger the value.",
        pop="Shaded by <b>population</b>: the central development region, including the Kathmandu Valley, is extremely dense. The western and far-western development regions are clearly sparser.",
        desc="Districts are the basic administrative units below the development regions.",
        src="<b>Data source</b>: development-region and district boundaries from GADM 4.1 (gadm41_NPL_shp, WGS84 / EPSG:4326, open data). Areas are computed spherically from geometry (approximate). Administrative types come from GADM's ENGTYPE field. Population, capitals and Chinese names are manually compiled (approximate). This map shows administrative boundaries for illustration only; the way boundaries are drawn does not represent any position.",
    ),
    "nzl-regions": dict(
        ov="New Zealand Overview",
        title="New Zealand Administrative Divisions · Population, Area & Type of 16 Regions",
        lead="A South Pacific island nation with 16 regions plus the Chatham Islands territory and outlying island areas. Click the map to see each region's Chinese name, capital, population, area and type.",
        pop="Shaded by <b>population</b>: the Auckland region alone holds about a third of the national population. The West Coast of the South Island and the southern islands are sparsely populated.",
        desc="Territorial authorities are the basic administrative units below the regions.",
        src="<b>Data source</b>: region and territorial-authority boundaries from GADM 4.1 (gadm41_NZL_shp, WGS84 / EPSG:4326, open data). Chinese names follow standard translations. Areas are computed spherically from geometry (approximate). Administrative types come from GADM's ENGTYPE field. Population and capitals are manually compiled (approximate). This map shows administrative boundaries for illustration only; the way boundaries are drawn does not represent any position.",
    ),
    "pak-regions": dict(
        ov="Pakistan Overview",
        title="Pakistan Administrative Divisions · Population, Area & Type of 4 Provinces / Territories",
        lead="The land of the Indus in northwestern South Asia: 4 provinces, 1 capital territory and 2 administered areas. The Indus irrigation plain feeds the great majority of the population, and the Karakoram Highway links it to China. Click the map to see each province / territory's Chinese name, capital, population, area and administrative type. The top bar switches shading between population, area and type — the darker the shade, the larger the value.",
        pop="Shaded by <b>population</b>: Punjab stands alone with more than half the national population. Sindh (Karachi) comes next. Balochistan in the southwest is the largest by area but the sparsest.",
        desc="Divisions are the basic administrative units below the provinces / territories.",
        src="<b>Data source</b>: province / territory and division boundaries from GADM 4.1 (gadm41_PAK_shp, WGS84 / EPSG:4326, open data). Areas are computed spherically from geometry (approximate). Administrative types come from GADM's ENGTYPE field. Population, capitals and Chinese names are manually compiled (approximate). This map shows administrative boundaries for illustration only; the way boundaries are drawn does not represent any position.",
    ),
    "phl-regions": dict(
        ov="Philippines Overview",
        title="Philippines Administrative Divisions · Population, Area & Type of 81 Provinces",
        lead="An archipelago of more than 7,000 islands. Its 81 provinces spread across the three island groups of Luzon, Visayas and Mindanao, on the Pacific Ring of Fire. Click the map to see each province's Chinese name, capital, population, area and administrative type. The top bar switches shading between population, area and type — the darker the shade, the larger the value.",
        pop="Shaded by <b>population</b>: the southern Luzon provinces around metro Manila — Bulacan, Cavite and Laguna — are extremely dense. Inland Mindanao and Palawan are far sparser.",
        desc="Municipalities are the basic administrative units below the provinces.",
        src="<b>Data source</b>: province and municipality boundaries from GADM 4.1 (gadm41_PHL_shp, WGS84 / EPSG:4326, open data). Areas are computed spherically from geometry (approximate). Administrative types come from GADM's ENGTYPE field. Population, capitals and Chinese names are manually compiled (approximate). This map shows administrative boundaries for illustration only; the way boundaries are drawn does not represent any position.",
    ),
    "prk-regions": dict(
        ov="North Korea Overview",
        title="North Korea Administrative Divisions · Population, Area & Type of 9 Provinces / Special Cities",
        lead="A closed country in the north of the Korean Peninsula: 9 provinces plus special cities such as Pyongyang. The province is the basic unit of administration. Click the map to see each province / special city's Chinese name, capital, population, area and administrative type. The top bar switches shading between population, area and type — the darker the shade, the larger the value.",
        pop="Shaded by <b>population</b>: Pyongyang and the western provinces of North and South Hwanghae concentrate the population. The northern mountains and the northeast are relatively sparse.",
        desc="Counties / cities are the basic administrative units below the provinces / special cities.",
        src="<b>Data source</b>: province / special-city and county / city boundaries from GADM 4.1 (gadm41_PRK_shp, WGS84 / EPSG:4326, open data). Areas are computed spherically from geometry (approximate). Administrative types come from GADM's ENGTYPE field. Population, capitals and Chinese names are manually compiled (approximate). This map shows administrative boundaries for illustration only; the way boundaries are drawn does not represent any position.",
    ),
    "prt-regions": dict(
        ov="Portugal Overview",
        title="Portugal Administrative Divisions · Population, Area & Type of 20 First-Level Units",
        lead="A country at the western end of Iberia on the Atlantic coast, with 20 first-level units (18 districts plus the Azores and Madeira autonomous regions). A historic seafaring empire, wine and sunny coasts define it. Click the map to see each district / autonomous region's Chinese name, capital, population, area and administrative type. The top bar switches shading between population, area and type — the darker the shade, the larger the value.",
        pop="Shaded by <b>population</b>: the two metro areas of Lisbon and Porto are dense. The inland centre and south (Alentejo) are sparse, and the Atlantic regions of the Azores and Madeira are vast but thinly populated.",
        desc="Municipalities are the basic administrative units below the districts / autonomous regions.",
        src="<b>Data source</b>: district / autonomous-region and municipality boundaries from GADM 4.1 (gadm41_PRT_shp, WGS84 / EPSG:4326, open data). Areas are computed spherically from geometry (approximate). Administrative types come from GADM's ENGTYPE field. Population, capitals and Chinese names are manually compiled (approximate). This map shows administrative boundaries for illustration only; the way boundaries are drawn does not represent any position.",
    ),
    "rus-regions": dict(
        ov="Russia Overview",
        title="Russia Administrative Divisions · Population, Area & Type of 83 Federal Subjects",
        lead="The world's largest country by area, with 83 federal subjects (republics, krais, oblasts, autonomous okrugs and federal cities). Click the map to see each subject's Chinese name, capital, population, area and type.",
        pop="Shaded by <b>population</b>: the city of Moscow and Moscow Oblast together exceed 21 million. The vast expanses of Siberia and the Far East are sparsely populated.",
        desc="Districts / cities are the basic administrative units below the federal subjects.",
        src="<b>Data source</b>: federal-subject and district / city boundaries from GADM 4.1 (gadm41_RUS_shp, WGS84 / EPSG:4326, open data). Chinese names follow standard translations. Areas are computed spherically from geometry (approximate). Administrative types come from GADM's ENGTYPE field. Population and capitals are manually compiled (approximate). This map shows administrative boundaries for illustration only; the way boundaries are drawn does not represent any position.",
    ),
    "sau-regions": dict(
        ov="Saudi Arabia Overview",
        title="Saudi Arabia Administrative Divisions · Population, Area & Type of 13 Provinces / Regions",
        lead="The largest country on the Arabian Peninsula, with 13 first-level provinces / regions. Desert covers most of the land of the oil kingdom. Click the map to see each province / region's Chinese name, capital, population, area and administrative type. The top bar switches shading between population, area and type — the darker the shade, the larger the value.",
        pop="Shaded by <b>population</b>: the western and central provinces of Riyadh and Mecca (including Jeddah) are densely populated. The northern and eastern desert provinces are sparse.",
        desc="Sub-divisions are the basic administrative units below the provinces / regions.",
        src="<b>Data source</b>: province / region and sub-division boundaries from GADM 4.1 (gadm41_SAU_shp, WGS84 / EPSG:4326, open data). Areas are computed spherically from geometry (approximate). Administrative types come from GADM's ENGTYPE field. Population, capitals and Chinese names are manually compiled (approximate). This map shows administrative boundaries for illustration only; the way boundaries are drawn does not represent any position.",
    ),
    "sgp-regions": dict(
        ov="Singapore Overview",
        title="Singapore Administrative Divisions · Population, Area & Type of 5 Regions",
        lead="A city-state at the southern tip of the Malay Peninsula, made up of 5 regions (Region) with no province–county tier. Click the map to see each region's Chinese name, capital, population, area and administrative type. The top bar switches shading between population, area and type — the darker the shade, the larger the value.",
        pop="Shaded by <b>area</b>: the planned regions in the west and northeast are larger, while the central business district is compact.",
        desc="There is no second administrative level below the regions.",
        src="<b>Data source</b>: region boundaries from GADM 4.1 (gadm41_SGP_shp, WGS84 / EPSG:4326, open data). Areas are computed spherically from geometry (approximate). Administrative types come from GADM's ENGTYPE field. Population, capitals and Chinese names are manually compiled (approximate). This map shows administrative boundaries for illustration only; the way boundaries are drawn does not represent any position.",
    ),
    "swe-regions": dict(
        ov="Sweden Overview",
        title="Sweden Administrative Divisions · Population, Area & Type of 21 Counties",
        lead="The largest Scandinavian country, with 21 counties (län). Forests, lakes and Lapland above the Arctic Circle make up its vastness. Click the map to see each county's Chinese name, capital, population, area and administrative type. The top bar switches shading between population, area and type — the darker the shade, the larger the value.",
        pop="Shaded by <b>population</b>: the southern counties of Stockholm and Västra Götaland (Gothenburg) are densely populated. Norrbotten and other northern counties are sparsely populated.",
        desc="Municipalities are the basic administrative units below the counties.",
        src="<b>Data source</b>: county and municipality boundaries from GADM 4.1 (gadm41_SWE_shp, WGS84 / EPSG:4326, open data). Areas are computed spherically from geometry (approximate). Administrative types come from GADM's ENGTYPE field. Population, capitals and Chinese names are manually compiled (approximate). This map shows administrative boundaries for illustration only; the way boundaries are drawn does not represent any position.",
    ),
    "tha-regions": dict(
        ov="Thailand Overview",
        title="Thailand Administrative Divisions · Population, Area & Type of 77 Provinces",
        lead="A constitutional monarchy in the central Indochinese Peninsula with 77 provinces (first-level units) and the capital Bangkok. A tropical monsoon climate, rice and tourism are famous here. Click the map to see each province / municipality's Chinese name, capital, population, area and administrative type. The top bar switches shading between population, area and type — the darker the shade, the larger the value.",
        pop="Shaded by <b>population</b>: Bangkok and the surrounding central provinces are highly dense. The northern and northeastern plateau provinces are relatively sparse.",
        desc="Districts are the basic administrative units below the provinces / metropolitan area.",
        src="<b>Data source</b>: province / municipality and district boundaries from GADM 4.1 (gadm41_THA_shp, WGS84 / EPSG:4326, open data). Areas are computed spherically from geometry (approximate). Administrative types come from GADM's ENGTYPE field. Population, capitals and Chinese names are manually compiled (approximate). This map shows administrative boundaries for illustration only; the way boundaries are drawn does not represent any position.",
    ),
    "tur-regions": dict(
        ov="Turkey Overview",
        title="Turkey Administrative Divisions · Population, Area & Type of 81 Provinces",
        lead="A NATO country straddling Europe and Asia, with 81 provinces. The Anatolian plateau and Istanbul's Europe–Asia junction are its most striking geographic features. Click the map to see each province's Chinese name, capital, population, area and administrative type. The top bar switches shading between population, area and type — the darker the shade, the larger the value.",
        pop="Shaded by <b>population</b>: the western provinces of Istanbul, Ankara and Izmir are highly concentrated. The eastern and southeastern mountain provinces are sparse.",
        desc="Districts are the basic administrative units below the provinces.",
        src="<b>Data source</b>: province and district boundaries from GADM 4.1 (gadm41_TUR_shp, WGS84 / EPSG:4326, open data). Areas are computed spherically from geometry (approximate). Administrative types come from GADM's ENGTYPE field. Population, capitals and Chinese names are manually compiled (approximate). This map shows administrative boundaries for illustration only; the way boundaries are drawn does not represent any position.",
    ),
    "tza-regions": dict(
        ov="Tanzania Overview",
        title="Tanzania Administrative Divisions · Population, Area & Type of 31 Regions",
        lead="An East African country with 31 regions. Kilimanjaro, Lake Victoria and the Dar es Salaam–central railway corridor define it. Click the map to see each region's Chinese name, capital, population, area and administrative type. The top bar switches shading between population, area and type — the darker the shade, the larger the value.",
        pop="Shaded by <b>population</b>: Dar es Salaam and the surrounding lake regions are dense. The central-western and northern semi-arid regions are sparse.",
        desc="Districts are the basic administrative units below the regions.",
        src="<b>Data source</b>: region and district boundaries from GADM 4.1 (gadm41_TZA_shp, WGS84 / EPSG:4326, open data). Areas are computed spherically from geometry (approximate). Administrative types come from GADM's ENGTYPE field. Population, capitals and Chinese names are manually compiled (approximate). This map shows administrative boundaries for illustration only; the way boundaries are drawn does not represent any position.",
    ),
    "uk-regions": dict(
        ov="United Kingdom Overview",
        title="UK Administrative Divisions · Population & Area of 4 Constituent Countries",
        lead="The United Kingdom consists of four constituent countries — England, Scotland, Wales and Northern Ireland. It is a unitary state, not a federation: Scotland, Wales and Northern Ireland have had devolved legislatures since 1998, while England has none. Click the map to see each constituent country's capital, population, area and devolution status. The top bar switches shading between population and area — the darker the shade, the larger the value.",
        desc="",
        src="<b>Data source</b>: constituent-country boundaries from GADM 4.1 (gadm41_GBR_shp, WGS84 / EPSG:4326, open data). Capitals, population and area are manually compiled (approximate). For quick reference only.",
    ),
    "ukr-regions": dict(
        ov="Ukraine Overview",
        title="Ukraine Administrative Divisions · Population, Area & Highlights of 27 Oblast-Level Units",
        lead="Ukraine consists of 27 oblast-level units: 24 oblasts, the city of Kyiv, the Autonomous Republic of Crimea and the city of Sevastopol. The Dnieper cuts the country in two — west toward Europe, east toward the Black Sea and Donbas. Click the map to see each unit's Chinese translation, Cyrillic original name, population, area and highlights.",
        pop="Shaded by <b>population</b>. The city of Kyiv and the industrial oblasts of Donetsk, Dnipropetrovsk, Kharkiv and Odesa hold most of the population.",
        desc="Raions and cities are the basic administrative units below an oblast. This map uses GADM 4.1's pre-2020-reform figures, with more than 620 raions and cities nationwide.",
        src="<b>Data source</b>: oblast-level and raion / city boundaries from GADM 4.1 (gadm41_UKR_shp, WGS84 / EPSG:4326, open data). Cyrillic original names come from GADM's NL_NAME_1 field. Chinese translations follow standard usage. Population is from official estimates around 2021 (approximate); areas are computed from geometry. For quick reference only. Note: raions follow the pre-2020-reform division, and one anomalous record with all-「?」 fields in the GADM source has been removed.",
    ),
    "usa-regions": dict(
        ov="United States Overview",
        title="United States Administrative Divisions · Population, Area & Type of 50 States / Federal District",
        lead="50 states plus the District of Columbia, spanning the North American continent and reaching into the Pacific. Click the map to see each state's Chinese name, capital, population, area and type.",
        pop="Shaded by <b>population</b>: California, Texas and Florida have the largest populations. The New England states in the northeast are small but dense.",
        desc="Counties are the basic administrative units below the states.",
        src="<b>Data source</b>: state / federal district and county boundaries from GADM 4.1 (gadm41_USA_shp, WGS84 / EPSG:4326, open data). Chinese names follow standard translations. Areas are computed spherically from geometry (approximate). Administrative types come from GADM's ENGTYPE field. Population and capitals are manually compiled (approximate). This map shows administrative boundaries for illustration only; the way boundaries are drawn does not represent any position.",
    ),
    "uzb-regions": dict(
        ov="Uzbekistan Overview",
        title="Uzbekistan Administrative Divisions · Population, Area & Type of 12 Regions / Republic / City",
        lead="A country in Central Asia: 12 regions plus the Republic of Karakalpakstan and the city of Tashkent. Doubly landlocked, with oases and cotton. Click the map to see each region / republic / city's Chinese name, capital, population, area and administrative type. The top bar switches shading between population, area and type — the darker the shade, the larger the value.",
        pop="Shaded by <b>population</b>: Tashkent city and the Fergana Valley regions are dense. Karakalpakstan in the west and the Kyzylkum Desert regions are sparse.",
        desc="Districts are the basic administrative units below the regions / republic / city.",
        src="<b>Data source</b>: region / republic / city and district boundaries from GADM 4.1 (gadm41_UZB_shp, WGS84 / EPSG:4326, open data). Areas are computed spherically from geometry (approximate). Administrative types come from GADM's ENGTYPE field. Population, capitals and Chinese names are manually compiled (approximate). This map shows administrative boundaries for illustration only; the way boundaries are drawn does not represent any position.",
    ),
    "vnm-regions": dict(
        ov="Vietnam Overview",
        title="Vietnam Administrative Divisions · Population, Area & Highlights of 63 Province-Level Units",
        lead="Vietnam consists of 63 province-level units (57 provinces + 6 municipalities), one of the largest first-level systems in the world. Below them are more than 700 districts / wards / towns. The country stretches 1,650 km from north to south, with a delta \"population sea\" at each end. Click the map to see each province-level unit's Chinese translation, provincial capital, population, area and highlights.",
        pop="Shaded by <b>population</b>. Ho Chi Minh City (about 9 million) and Hanoi (about 8.25 million) lead as twin poles, and the Red River and Mekong deltas are the densest.",
        desc="Districts (huyện), wards (quận) and towns (thị xã) are the basic administrative units below a province-level unit, more than 700 nationwide.",
        src="<b>Data source</b>: province-level and district / ward / town boundaries from GADM 4.1 (gadm41_VNM_shp, WGS84 / EPSG:4326, open data). Chinese translations follow standard usage. Population is from recent censuses / official estimates (approximate); areas are computed from geometry. For quick reference only.",
    ),
    "zaf-regions": dict(
        ov="South Africa Overview",
        title="South Africa Administrative Divisions · Population, Area & Type of 9 Provinces",
        lead="The country at the southern tip of the African continent, with 9 provinces and three capitals (Pretoria for the executive, Cape Town for the legislature, Bloemfontein for the judiciary). Mining, wine and Africa's most complete industrial system are all here. Click the map to see each province's Chinese name, capital, population, area and administrative type. The top bar switches shading between population, area and type — the darker the shade, the larger the value.",
        pop="Shaded by <b>population</b>: Gauteng (Johannesburg–Pretoria) and the Durban area of KwaZulu-Natal are the densest. The Northern Cape desert is extremely sparse.",
        desc="Districts / metros are the basic administrative units below the provinces.",
        src="<b>Data source</b>: province and district / metro boundaries from GADM 4.1 (gadm41_ZAF_shp, WGS84 / EPSG:4326, open data). Areas are computed spherically from geometry (approximate). Administrative types come from GADM's ENGTYPE field. Population, capitals and Chinese names are manually compiled (approximate). This map shows administrative boundaries for illustration only; the way boundaries are drawn does not represent any position.",
    ),
}

# ── area / group 点评（去重后共 28 条；键为剥离 <b> 后的纯文本）──────────────
NOTE_EN = {
    "按面积着色：由几何球面实算，颜色越深面积越大。":
        "Shaded by <b>area</b>: computed spherically from geometry — the darker the shade, the larger the area.",
    "按行政区类型着色：州 / 省 / 酋长国 / 道 / 共和国 / 边疆区等一目了然。":
        "Shaded by <b>administrative type</b>: states / provinces / emirates / dō / republics / krais at a glance.",
    "按面积着色：亚马孙流域的帕拉、亚马逊、马托格罗索等州幅员惊人，里约热内卢、圣保罗等东南州则小得只剩沿海一溜。":
        "Shaded by <b>area</b>: the Amazonian states of Pará, Amazonas and Mato Grosso are astonishingly large, while Rio de Janeiro and São Paulo shrink to a thin coastal strip.",
    "按行政区类型着色：26 个州与 1 个联邦区一目了然。":
        "Shaded by <b>administrative type</b>: 26 states and 1 federal district at a glance.",
    "按面积着色：努纳武特、魁北克、西北领地三个北方单位占了国土近七成，而人口密集的安大略、魁北克南部只是东南一角。":
        "Shaded by <b>area</b>: Nunavut, Quebec and the Northwest Territories take up nearly 70% of the land, while populous Ontario and southern Quebec occupy only the southeastern corner.",
    "按行政区类型着色：10 个省与 3 个地区一目了然。":
        "Shaded by <b>administrative type</b>: 10 provinces and 3 territories at a glance.",
    "按面积着色：巴伐利亚、下萨克森等南部大州面积居前，柏林、汉堡、不莱梅三个城市州小到几乎只是一个点。":
        "Shaded by <b>area</b>: the large southern states of Bavaria and Lower Saxony lead, while the city-states of Berlin, Hamburg and Bremen are almost just a dot.",
    "按行政区类型着色：16 个联邦州。":
        "Shaded by <b>administrative type</b>: 16 federal states.",
    "按面积着色。新河谷省一家就占国土约四成，而开罗、杜姆亚特等城市省在图上几乎找不到。":
        "Shaded by <b>area</b>. The New Valley governorate alone covers about 40% of the country, while city governorates such as Cairo and Damietta are almost invisible on the map.",
    "按四大区域着色。尼罗河谷与三角洲集中了全国 95% 以上的人口，而国土的大头属于东西两侧的沙漠省。":
        "Shaded by <b>four macro-regions</b>. The Nile valley and delta hold over 95% of the population, while most of the land belongs to the desert governorates east and west.",
    "按面积着色。卡斯蒂利亚-莱昂是最大自治区（约 9.4 万 km²），马德里反而只排第 12。":
        "Shaded by <b>area</b>. Castile and León is the largest autonomous community (about 94,000 km²); Madrid ranks only 12th.",
    "按五大区域着色。绿色西班牙沿北大西洋，梅塞塔高原是骨架，地中海东岸与安达卢西亚各自成块。":
        "Shaded by <b>five macro-regions</b>. Green Spain lines the North Atlantic, the Meseta is the backbone, and the Mediterranean east and Andalusia each form their own block.",
    "按行政区类型着色：州 / 省 / 特别市 / 联邦直辖区 / 直管区等一目了然。":
        "Shaded by <b>administrative type</b>: states / provinces / special cities / federal territories / administered areas at a glance.",
    "按行政区类型着色：省 / 邦 / 中央直辖区等一目了然。":
        "Shaded by <b>administrative type</b>: provinces / states / union territories at a glance.",
    "按面积着色。庆尚北道最大（约 1.9 万 km²），首尔只有 605 km² 却住着近千万人。":
        "Shaded by <b>area</b>. North Gyeongsang is the largest (about 19,000 km²), while Seoul has only 605 km² yet houses nearly ten million people.",
    "按六大圈域着色。首都圈、忠清、湖南、岭南、江原与济州——首尔独大、岭南与湖南对峙，是韩国政治地理的主轴。":
        "Shaded by <b>six regions</b>. The capital area, Chungcheong, Honam, Yeongnam, Gangwon and Jeju — Seoul's dominance and the Honam–Yeongnam rivalry form the axis of Korean political geography.",
    "按面积着色。南戈壁、东戈壁等戈壁省份最大，人口却最少——蒙古的「大」与「空」是同一件事。":
        "Shaded by <b>area</b>. The Gobi provinces of South and East Gobi are the largest yet hold the fewest people — Mongolia's \"bigness\" and \"emptiness\" are the same fact.",
    "按四大自然区域着色：西部山区、杭爱中部、戈壁地带与东部草原，游牧经济沿此分带。":
        "Shaded by <b>four natural regions</b>: the western mountains, the Khangai centre, the Gobi belt and the eastern steppe — pastoral economy bands along this divide.",
    "按面积着色：南岛的南方区、坎特伯雷等大区辽阔多山，北岛北地等则相对小巧。":
        "Shaded by <b>area</b>: the southern regions of Southland and Canterbury are vast and mountainous, while Northland on the North Island is comparatively compact.",
    "按行政区类型着色：大区、领地与外岛区域一目了然。":
        "Shaded by <b>administrative type</b>: regions, territories and outlying island areas at a glance.",
    "按面积着色：萨哈（雅库特）、克拉斯诺亚尔斯克等西伯利亚单位大得惊人，莫斯科、圣彼得堡等欧洲部分则只是弹丸之地。":
        "Shaded by <b>area</b>: the Siberian units of Sakha (Yakutia) and Krasnoyarsk are astonishingly large, while European parts such as Moscow and Saint Petersburg are mere specks.",
    "按行政区类型着色：共和国、边疆区、州、自治区、自治州与直辖市六类一目了然。":
        "Shaded by <b>administrative type</b>: six classes — republics, krais, oblasts, autonomous okrugs, autonomous oblasts and federal cities — at a glance.",
    "按面积着色。敖德萨、第聂伯罗、切尔尼戈夫是面积最大的州，西部各州相对紧凑。":
        "Shaded by <b>area</b>. Odesa, Dnipropetrovsk and Chernihiv are the largest oblasts; the western oblasts are more compact.",
    "按五大方位着色：北部、中部、东部、南部与西部——第聂伯河与历史上的边界至今仍在左右这张图。":
        "Shaded by <b>five cardinal regions</b>: north, centre, east, south and west — the Dnieper and historic borders still shape this map.",
    "按面积着色：阿拉斯加、得克萨斯、加利福尼亚等西部大州辽阔，东北新英格兰诸州与特区则小巧密集。":
        "Shaded by <b>area</b>: the large western states of Alaska, Texas and California are vast, while the northeastern New England states and the District are small and dense.",
    "按行政区类型着色：50 个州与 1 个联邦区一目了然。":
        "Shaded by <b>administrative type</b>: 50 states and 1 federal district at a glance.",
    "按面积着色。义安是最大的省，胡志明市与河南、北宁等小省在图上几乎找不到。":
        "Shaded by <b>area</b>. Nghe An is the largest province, while Ho Chi Minh City and small provinces such as Ha Nam and Bac Ninh are almost invisible on the map.",
    "按八大经济区着色：红河三角洲与湄公河三角洲是两大粮仓与人海，西原与西北是山地高原。":
        "Shaded by <b>eight economic regions</b>: the Red River and Mekong deltas are the two granaries and population seas, while the Central Highlands and Northwest are mountainous plateaus.",
}

# ── 面板说明（勾选二级区划线句）模板 ──
PANEL_RE = re.compile(
    r"^色块按人口分级（越深越多）；选「面积」则按面积、选「类型」按行政区类型分类着色。"
    r"选中后色块变透明、用色环勾边。(?:勾选「([^」]+)」可看省以下的行政边界。)?$"
)

# 应用前缀 → GADM 三位代码（au/jp 与 slugs 不一致）
CODE_FIX = {"AU": "AUS", "JP": "JPN"}

# 13 个非标准面板文案（第三指标为区域类分组的国家）
PANEL_EN = {
    "bra-regions": "Shaded by population / area (darker means larger); pick Type for categorical colours by administrative class. A selected unit turns transparent with a coloured ring. Tick “municipalities” to see boundaries below the first level.",
    "can-regions": "Shaded by population / area (darker means larger); pick Type for categorical colours by administrative class. A selected unit turns transparent with a coloured ring. Tick “census divisions” to see boundaries below the first level.",
    "deu-regions": "Shaded by population / area (darker means larger); pick Type for categorical colours by administrative class. A selected unit turns transparent with a coloured ring. Tick “administrative districts” to see boundaries below the first level.",
    "egy-regions": "Shaded by population / area on a sand-gold scale (darker means larger); pick Region for categorical colours by the four macro-regions. A selected governorate turns transparent with a coloured ring. Tick “districts” to see boundaries below the governorates.",
    "esp-regions": "Shaded by population / area on a red scale (darker means larger); pick Region for categorical colours by the five macro-regions. The view is framed on mainland Iberia; the Canary Islands and the North African enclaves need manual panning. Tick “provinces” to see boundaries below the autonomous communities.",
    "kor-regions": "Shaded by population / area on a teal scale (darker means larger); pick Region for categorical colours by the six regions. A selected province-level unit turns transparent with a coloured ring. Tick “cities / counties / districts” to see the grassroots boundaries.",
    "mng-regions": "Shaded by population / area on a steppe-green scale (darker means larger); pick Natural Region for categorical colours by the four regions. A selected province / capital turns transparent with a coloured ring. Tick “sums” to see the grassroots boundaries.",
    "nzl-regions": "Shaded by population / area (darker means larger); pick Type for categorical colours by administrative class. A selected unit turns transparent with a coloured ring. Tick “territorial authorities” to see boundaries below the first level.",
    "rus-regions": "Shaded by population / area (darker means larger); pick Type for categorical colours by administrative class. A selected unit turns transparent with a coloured ring. Tick “districts / cities” to see boundaries below the first level.",
    "uk-regions": "Shaded by population / area (cool colours, darker means larger). A selected country turns transparent with a blue ring. Tick “second-level divisions” to see the grassroots local-government boundaries.",
    "ukr-regions": "Shaded by population / area on a blue scale (darker means larger); pick Region for categorical colours by the five cardinal regions. A selected oblast-level unit turns transparent with a coloured ring. Tick “raions / cities” to see the pre-2020-reform boundaries.",
    "usa-regions": "Shaded by population / area (darker means larger); pick Type for categorical colours by administrative class. A selected unit turns transparent with a coloured ring. Tick “counties” to see boundaries below the first level.",
    "au-regions": "Shaded by population / area (warm colours, darker means larger). A selected state turns transparent with a golden ring. Tick “local government areas” to see the grassroots administrative boundaries.",
    "jp-regions": "Shaded by population / area on a red scale (darker means larger); pick Region for categorical colours by the 8 regions. A selected prefecture turns transparent with a red ring. Tick “municipalities” to see the grassroots administrative boundaries.",
    "vnm-regions": "Shaded by population / area on a red scale (darker means larger); pick Region for categorical colours by the eight economic regions. A selected province-level unit turns transparent with a coloured ring. Tick “districts / wards” to see boundaries below the provinces.",
}


# ── 统计条 <small> 标签（mainLabel/subRole 为空或与统计条不一致的特殊应用） ──
STAT_EN = {
    "一级行政区": "First-level units",
    "二级行政区": "Second-level divisions",
    "县/郡": "Districts",
    "大区 / 群岛": "Regions / island groups",
    "州 / 联邦区 / 领地": "States / federal district / territories",
    "州级单位": "Top-level units",
    "市/郡/区": "Cities / counties / districts",
    "市町村": "Municipalities",
    "构成国": "Constituent countries",
    "省 / 领地": "Provinces / territories",
    "苏木": "Sums",
    "道市级": "Provinces / cities",
    "都道府県": "Prefectures",
}

# ── 指标按钮 / 详情卡第三标签（共享 JS 的 EN_LABEL 只覆盖图例与提示，
#    metricSeg 静态按钮与 dtLb3 运行时写入仍走词典） ──
LBL_EN = {
    "县厅": "Prefectural capital",
    "行政中心": "Administrative centre",
    "地方": "Region",
    "圈域": "Region",
    "方位": "Cardinal Region",
    "自然区域": "Natural Region",
}

# ── metricNote（JS 写入 id=metricNote 的展开点评） ──
METRIC_EN = {
    "按人口着色（2021 年人口普查，ABS）。澳大利亚人口高度集中在东南沿海——新南威尔士与维多利亚两州就占了全国一半以上。":
        "Shaded by population (2021 Census, ABS). Australia's population is heavily concentrated on the southeast coast — New South Wales and Victoria alone hold more than half the national total.",
    "按人口着色（2020 年国势调查）。东京都一极集中——关东地方（东京、神奈川、埼玉、千叶）就占了全国四成以上人口。":
        "Shaded by population (2020 Census). Tokyo is extremely dominant — the Kanto region (Tokyo, Kanagawa, Saitama, Chiba) alone holds more than 40% of the national population.",
    "按人口着色（ONS 2022 年中估计）。英格兰一地就占了全英约 84% 的人口，与苏格兰、威尔士、北爱形成悬殊对比——所以用 log 尺度分档，避免小地方被压成同一色。":
        "Shaded by population (ONS mid-2022 estimate). England alone holds about 84% of the UK population, in sharp contrast with Scotland, Wales and Northern Ireland — hence the log-scale classes, so small places are not flattened into one colour.",
}

# ── 合规声明（涉界必译；egy/esp/kor/mng 共用通用版） ──
CLAIM_GENERIC = ("合规说明：本图数据为国外项目整理的第三方行政边界，界线画法不代表中国政府立场；"
                 "涉及中国疆域的正式制图请使用自然资源部标准地图服务的官方数据。")
CLAIM_EN = {
    CLAIM_GENERIC:
        "<b>Compliance note</b>: the boundaries in this map come from third-party administrative data "
        "compiled by an overseas project. The drawing does not represent the position of the Chinese "
        "government. For official mapping of China's territory, use the official data from the Ministry "
        "of Natural Resources' standard map service.",
    "领土声明：钓鱼岛及其附属岛屿自古以来就是中国的固有领土，中国对其拥有无可争辩的主权。原始 GADM 数据依日方口径将其并入「沖縄県石垣市」，该画法不代表中国政府立场；本站已在矢量数据中完整剔除钓鱼岛及其附属岛屿，本图不再显示其任何几何。":
        "<b>Territorial statement</b>: the Diaoyu Islands and their affiliated islands have been China's "
        "inherent territory since ancient times, and China enjoys indisputable sovereignty over them. The "
        "original GADM data merges them into \u201cOkinawa-ken Ishigaki-shi\u201d under the Japanese convention; "
        "that drawing does not represent the position of the Chinese government. This site has completely "
        "removed the Diaoyu Islands and their affiliated islands from the vector data, and no geometry of "
        "them is shown in this map.",
    "合规说明：克里米亚与塞瓦斯托波尔等条目的归属与界线画法完全沿用 GADM 源数据口径，不代表任何立场；涉及国界的正式制图请以中国官方发布及自然资源部标准地图服务为准。":
        "<b>Compliance note</b>: the attribution and boundary drawing of entries such as Crimea and "
        "Sevastopol follow the GADM source data exactly and represent no position. For official mapping "
        "involving national boundaries, refer to China's official releases and the Ministry of Natural "
        "Resources' standard map service.",
    "领土声明：西沙群岛、南沙群岛自古以来就是中国的固有领土，中国对其拥有无可争辩的主权。实测 GADM 4.1 越南数据不含上述任何几何，本图亦不显示相关内容；数据界线画法不代表中国政府立场，涉华制图请用自然资源部标准地图服务。":
        "<b>Territorial statement</b>: the Xisha Islands and the Nansha Islands have been China's inherent "
        "territory since ancient times, and China enjoys indisputable sovereignty over them. Testing shows "
        "that the GADM 4.1 Vietnam data contains no geometry of the above, and this map shows no related "
        "content either. The boundary drawing of the data does not represent the position of the Chinese "
        "government; for mapping involving China, use the Ministry of Natural Resources' standard map "
        "service.",
    "**制图合规说明**：黄岩岛（民主礁，15°07′N、117°51′E）是中国固有领土，隶属中国海南省三沙市，不属于菲律宾任何一级行政区。本站遵循中国法律法规与地图编制规范，已在数据转换阶段对源数据做几何核查与兜底剔除：**本图的菲律宾矢量中不含黄岩岛（亦不含其所谓「Bajo de Masinloc / Panatag Shoal」）要素，相关岛礁不作为菲律宾行政区呈现、面积亦不计入统计**。地图界线画法以中方主张为准，正式制图请使用自然资源部标准地图服务提供的官方数据。":
        "<b>Cartographic compliance note</b>: Huangyan Island (Democrat Reef, 15\u00b007\u2032N, 117\u00b051\u2032E) "
        "is China's inherent territory, under the jurisdiction of Sansha City, Hainan Province, China, and "
        "does not belong to any administrative division of the Philippines. Following Chinese laws, "
        "regulations and mapping standards, this site has verified the geometry of the source data and "
        "removed the offending features during the data conversion stage: <b>the Philippine vector data in "
        "this map contains no Huangyan Island feature (nor the so-called \u201cBajo de Masinloc / Panatag "
        "Shoal\u201d); the relevant islands and reefs are not presented as Philippine administrative divisions, "
        "and their area is not counted in the statistics</b>. The boundary drawing follows China's claims; "
        "for official mapping, please use the official data provided by the Ministry of Natural Resources' "
        "standard map service.",
}


def strip_tags(s):
    return re.sub(r"<[^>]+>", "", s or "")


def build():
    exact = {}
    missing = []

    def put(zh, en):
        if not zh or not en:
            return
        k = strip_tags(zh).strip()
        if k and k not in exact:
            exact[k] = en

    # ① 共享短标签（chrome 级）
    exact["行政区划地图"] = "Administrative Divisions"
    exact["总面积"] = "Total area"

    # ② 逐应用
    for app, rec in DATA.items():
        code = CODE_FIX.get(rec["code"], rec["code"])
        c = COUNTRIES.get(code)
        if not c:
            missing.append((app, "COUNTRIES"))
            continue
        h = HAND.get(app, {})
        l1zh = rec.get("mainLabel") or ""
        l2zh = rec.get("subRole") or ""
        # h1 国家名 / 完整标题 / 总览按钮
        exact[l1zh] = c["l1"]
        if l2zh and l2zh != "无":
            exact[l2zh] = c["l2"]
        if l1zh:
            exact[f"{l1zh}名称"] = f"{c['l1']} names"
        # introBar 完整标题（如「法国行政区划地图」）
        m = re.match(r"^(.+?)行政区划地图$", strip_tags(rec.get("title") or ""))
        # title 形如「法国行政区划地图 · …」，国家名取「法国」
        tzh = strip_tags(rec.get("title") or "")
        m2 = re.match(r"^(.+?)行政区划地图", tzh)
        if m2:
            exact[m2.group(1)] = c["name"]
            exact[m2.group(1) + "行政区划地图"] = f"{c['name']} Administrative Divisions"
        # 总览按钮
        ov_zh = strip_tags(rec.get("overview") or "")
        if ov_zh:
            exact[ov_zh] = h.get("ov") or f"{c['name']} Overview"
        # 标题 / 导语 / 人口点评 / 二级说明 / 数据来源
        put(rec.get("title"), h.get("title"))
        put(rec.get("lead"), h.get("lead"))
        put(rec.get("popnote"), h.get("pop"))
        put(rec.get("subDesc"), h.get("desc"))
        put(rec.get("src"), h.get("src"))
        # area / group 点评
        for k in ("areanote", "groupnote"):
            zh = strip_tags(rec.get(k) or "")
            if zh:
                en = NOTE_EN.get(zh)
                if en:
                    put(zh, en)
                else:
                    missing.append((app, k))
        # 面板说明
        pz = strip_tags(rec.get("panel") or "")
        pm = PANEL_RE.match(pz)
        if pm:
            l2 = pm.group(1)
            en = ("Shaded by population (darker means more); pick Area to shade by size, "
                  "or Type for categorical colours by administrative class. A selected region "
                  "turns transparent with a coloured ring.")
            if l2:
                en += f" Tick \u201c{c['l2']}\u201d to show boundaries below the first level."
            put(pz, en)
        elif app in PANEL_EN:
            put(pz, PANEL_EN[app])
        elif pz:
            missing.append((app, "panel"))

    # ③ 统计条标签 / 指标按钮 / metricNote / 合规声明（后写，不覆盖已有键）
    for zh, en in list(STAT_EN.items()) + list(LBL_EN.items()) + list(METRIC_EN.items()) + list(CLAIM_EN.items()):
        put(zh, en)

    return exact, missing


if __name__ == "__main__":
    exact, missing = build()
    dst = os.path.join(ROOT, "scripts", "i18n-maps-src", "regions.json")
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    json.dump({"exact": exact}, open(dst, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"regions.json: {len(exact)} entries; missing={len(missing)}")
    for a, k in missing:
        print("  MISSING", a, k)
