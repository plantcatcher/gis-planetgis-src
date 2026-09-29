// 自动生成自 D:/MyWebs/wiki/src/data/resources.ts（GIS 资源导航聚合站）
// 仅保留站内展示所需中文字段，去掉 lucide 图标名与 simple-icons CDN logoUrl。
// 重新生成：node scripts/gen_wiki_data.mjs

export interface WikiCategory {
  id: string;
  nameZh: string;
  description: string;
}

export interface WikiResource {
  id: string;
  nameZh: string;
  descriptionZh: string;
  url: string;
  categoryId: string;
  subcategory?: string;
}

export const wikiCategories: WikiCategory[] = [
  {
    "id": "open-books",
    "nameZh": "开源书籍",
    "description": "免费的地理空间相关电子书"
  },
  {
    "id": "gis-software",
    "nameZh": "地理信息系统软件",
    "description": "桌面和云端GIS软件"
  },
  {
    "id": "remote-sensing",
    "nameZh": "遥感软件",
    "description": "遥感图像处理和分析工具"
  },
  {
    "id": "3d-applications",
    "nameZh": "3D应用",
    "description": "三维地理可视化应用"
  },
  {
    "id": "web-map-servers",
    "nameZh": "Web地图服务器",
    "description": "地图服务发布和管理工具"
  },
  {
    "id": "frontend-framework",
    "nameZh": "前端框架",
    "description": "Web地图前端开发框架"
  },
  {
    "id": "spatial-database",
    "nameZh": "空间数据库",
    "description": "支持空间数据存储和查询的数据库"
  },
  {
    "id": "mobile-tools",
    "nameZh": "移动开发工具",
    "description": "移动端GIS开发工具"
  },
  {
    "id": "desktop-tools",
    "nameZh": "桌面开发工具",
    "description": "桌面端GIS开发工具"
  },
  {
    "id": "deep-learning",
    "nameZh": "深度学习",
    "description": "地理空间深度学习框架和数据集"
  },
  {
    "id": "map-render",
    "nameZh": "地图渲染引擎",
    "description": "地图渲染引擎和工具"
  },
  {
    "id": "geospatial-library",
    "nameZh": "地理空间库",
    "description": "各语言地理空间处理库"
  },
  {
    "id": "open-standards",
    "nameZh": "开放标准",
    "description": "地理空间相关开放标准"
  },
  {
    "id": "cloud-service",
    "nameZh": "云服务",
    "description": "地理空间云服务平台"
  },
  {
    "id": "conference",
    "nameZh": "会议与社区",
    "description": "GIS相关会议和社区"
  },
  {
    "id": "data",
    "nameZh": "数据资源",
    "description": "免费地理空间数据集"
  },
  {
    "id": "news",
    "nameZh": "新闻网站",
    "description": "GIS相关新闻和资讯"
  },
  {
    "id": "amazing-maps",
    "nameZh": "精彩地图网站",
    "description": "令人惊叹的地图网站"
  },
  {
    "id": "domestic-platforms",
    "nameZh": "国内地理平台",
    "description": "国产地图服务与地理数据平台"
  },
  {
    "id": "learning",
    "nameZh": "学习资源",
    "description": "GIS与地理空间学习教程与社区"
  }
];

export const wikiResources: WikiResource[] = [
  {
    "id": "ob-1",
    "nameZh": "Julia地理空间数据科学",
    "descriptionZh": "一本关于使用Julia编程语言进行地理空间数据科学的开源书籍。",
    "url": "https://juliaearth.github.io/geospatial-data-science-with-julia",
    "categoryId": "open-books"
  },
  {
    "id": "gis-1",
    "nameZh": "ArcGIS Desktop",
    "descriptionZh": "可扩展的桌面套件，用于在2D和3D环境中管理、可视化和分析GIS数据，包括图像处理功能。",
    "url": "https://www.esri.com/en-us/arcgis/products/arcgis-desktop/overview",
    "categoryId": "gis-software"
  },
  {
    "id": "gis-2",
    "nameZh": "DIVA-GIS",
    "descriptionZh": "一个免费的地理信息系统软件，用于分析地理数据，特别是生物多样性点数据。",
    "url": "https://www.diva-gis.org/",
    "categoryId": "gis-software"
  },
  {
    "id": "gis-3",
    "nameZh": "GeoDa",
    "descriptionZh": "免费开源软件工具，作为空间数据分析的入门工具。",
    "url": "http://geodacenter.github.io/",
    "categoryId": "gis-software"
  },
  {
    "id": "gis-4",
    "nameZh": "GISInternals",
    "descriptionZh": "提供GDAL和MapServer的每日构建包和软件开发工具包。",
    "url": "http://www.gisinternals.com/",
    "categoryId": "gis-software"
  },
  {
    "id": "gis-5",
    "nameZh": "Global Mapper",
    "descriptionZh": "一个易于使用、功能强大且价格实惠的GIS应用程序。",
    "url": "http://www.bluemarblegeo.com/products/global-mapper.php",
    "categoryId": "gis-software"
  },
  {
    "id": "gis-6",
    "nameZh": "GRASS GIS",
    "descriptionZh": "免费开源的GIS软件套件，用于地理空间数据管理和分析。",
    "url": "https://grass.osgeo.org/",
    "categoryId": "gis-software"
  },
  {
    "id": "gis-7",
    "nameZh": "gvSIG",
    "descriptionZh": "一个功能强大、用户友好、可互操作的GIS软件。",
    "url": "http://www.gvsig.com/en",
    "categoryId": "gis-software"
  },
  {
    "id": "gis-8",
    "nameZh": "JUMP GIS",
    "descriptionZh": "用Java编写的开源GIS软件。",
    "url": "http://jump-pilot.sourceforge.net/",
    "categoryId": "gis-software"
  },
  {
    "id": "gis-9",
    "nameZh": "MapInfo Pro",
    "descriptionZh": "功能齐全的桌面解决方案，用于为Web地图应用准备数据。",
    "url": "https://www.pitneybowes.com/us/location-intelligence/geographic-information-systems/mapinfo-pro.html",
    "categoryId": "gis-software"
  },
  {
    "id": "gis-10",
    "nameZh": "Marble",
    "descriptionZh": "虚拟地球仪和世界地图集。",
    "url": "https://marble.kde.org/",
    "categoryId": "gis-software"
  },
  {
    "id": "gis-11",
    "nameZh": "OpenOrienteering Mapper",
    "descriptionZh": "用于创建定向运动地图的软件。",
    "url": "https://github.com/openorienteering/mapper",
    "categoryId": "gis-software"
  },
  {
    "id": "gis-12",
    "nameZh": "QGIS",
    "descriptionZh": "免费开源的GIS软件。",
    "url": "http://qgis.org/en/site/",
    "categoryId": "gis-software"
  },
  {
    "id": "gis-13",
    "nameZh": "SAGA",
    "descriptionZh": "用于自动化地球科学分析的开源系统。",
    "url": "http://www.saga-gis.org/en/index.html",
    "categoryId": "gis-software"
  },
  {
    "id": "gis-14",
    "nameZh": "SharpMap",
    "descriptionZh": "易于使用的映射库，适用于Web和桌面应用。",
    "url": "https://github.com/SharpMap/SharpMap",
    "categoryId": "gis-software"
  },
  {
    "id": "gis-15",
    "nameZh": "TileMill",
    "descriptionZh": "开源地图设计工作室。",
    "url": "https://tilemill-project.github.io/tilemill/",
    "categoryId": "gis-software"
  },
  {
    "id": "gis-16",
    "nameZh": "uDig",
    "descriptionZh": "使用Eclipse富客户端技术构建的开源桌面应用框架。",
    "url": "http://udig.refractions.net/",
    "categoryId": "gis-software"
  },
  {
    "id": "gis-17",
    "nameZh": "Whitebox GAT",
    "descriptionZh": "开源桌面GIS和遥感软件包。",
    "url": "http://www.uoguelph.ca/~hydrogeo/Whitebox/",
    "categoryId": "gis-software"
  },
  {
    "id": "gis-18",
    "nameZh": "Abc-Map",
    "descriptionZh": "轻量级且用户友好的Web GIS。",
    "url": "https://abc-map.fr/",
    "categoryId": "gis-software"
  },
  {
    "id": "rs-1",
    "nameZh": "eCognition",
    "descriptionZh": "用于基于对象的图像分析的强大开发环境。",
    "url": "http://www.ecognition.com/suite/ecognition-developer",
    "categoryId": "remote-sensing"
  },
  {
    "id": "rs-2",
    "nameZh": "ENVI",
    "descriptionZh": "地理空间影像分析和处理软件。",
    "url": "https://www.harris.com/solution/envi",
    "categoryId": "remote-sensing"
  },
  {
    "id": "rs-3",
    "nameZh": "ERDAS IMAGINE",
    "descriptionZh": "地理空间影像分析和处理软件。",
    "url": "https://www.hexagongeospatial.com/products/power-portfolio/erdas-imagine",
    "categoryId": "remote-sensing"
  },
  {
    "id": "rs-4",
    "nameZh": "Google Earth",
    "descriptionZh": "基于卫星影像渲染3D地球的计算机程序。",
    "url": "https://www.google.com/earth/",
    "categoryId": "remote-sensing"
  },
  {
    "id": "rs-5",
    "nameZh": "Google Earth Studio",
    "descriptionZh": "用于Google Earth卫星和3D影像的动画工具。",
    "url": "https://www.google.com/earth/studio/",
    "categoryId": "remote-sensing"
  },
  {
    "id": "rs-6",
    "nameZh": "Opticks",
    "descriptionZh": "可扩展的遥感和影像分析软件平台。",
    "url": "https://opticks.org/",
    "categoryId": "remote-sensing"
  },
  {
    "id": "rs-7",
    "nameZh": "Orfeo Toolbox",
    "descriptionZh": "用于最先进遥感技术的开源项目。",
    "url": "https://www.orfeo-toolbox.org/",
    "categoryId": "remote-sensing"
  },
  {
    "id": "rs-8",
    "nameZh": "PANOPLY",
    "descriptionZh": "绘制来自netCDF、HDF、GRIB等数据集的地理参考数组。",
    "url": "https://www.giss.nasa.gov/tools/panoply/",
    "categoryId": "remote-sensing"
  },
  {
    "id": "rs-9",
    "nameZh": "PCI Geomatica",
    "descriptionZh": "用于处理地球观测数据的遥感桌面软件包。",
    "url": "http://www.pcigeomatics.com/software/geomatica/professional",
    "categoryId": "remote-sensing"
  },
  {
    "id": "rs-10",
    "nameZh": "SNAP",
    "descriptionZh": "所有Sentinel工具箱的通用架构。",
    "url": "http://step.esa.int/main/toolboxes/snap/",
    "categoryId": "remote-sensing"
  },
  {
    "id": "3d-1",
    "nameZh": "ArcGIS Earth",
    "descriptionZh": "允许您使用3D和2D地图数据探索世界的任何地方。",
    "url": "http://www.esri.com/software/arcgis-earth",
    "categoryId": "3d-applications"
  },
  {
    "id": "3d-2",
    "nameZh": "Beholder",
    "descriptionZh": "具有WebGPU/CesiumJS 3D地球的实时开源情报威胁地图。",
    "url": "https://beholder.me/",
    "categoryId": "3d-applications"
  },
  {
    "id": "3d-3",
    "nameZh": "CityEngine",
    "descriptionZh": "高级3D建模软件。",
    "url": "http://www.esri.com/software/cityengine/",
    "categoryId": "3d-applications"
  },
  {
    "id": "3d-4",
    "nameZh": "DEM Net Elevation API",
    "descriptionZh": "从开放数据在线生成3D地形模型。",
    "url": "https://elevationapi.com/",
    "categoryId": "3d-applications"
  },
  {
    "id": "3d-5",
    "nameZh": "Earth Enterprise",
    "descriptionZh": "Google Earth Enterprise的开源版本。",
    "url": "https://github.com/google/earthenterprise",
    "categoryId": "3d-applications"
  },
  {
    "id": "3d-6",
    "nameZh": "halfmaps",
    "descriptionZh": "将现实世界地理空间数据转换为模型的3D地图导出器。",
    "url": "https://www.halfmaps.io/",
    "categoryId": "3d-applications"
  },
  {
    "id": "3d-7",
    "nameZh": "Skyline",
    "descriptionZh": "用于构建逼真3D环境的3D桌面和Web应用。",
    "url": "http://www.skylineglobe.com/SkylineGlobe/corporate/Default.aspx?",
    "categoryId": "3d-applications"
  },
  {
    "id": "3d-8",
    "nameZh": "World Wind",
    "descriptionZh": "用于构建交互式3D地球可视化应用的SDK。",
    "url": "http://worldwind.arc.nasa.gov/java/",
    "categoryId": "3d-applications"
  },
  {
    "id": "3d-9",
    "nameZh": "LAStools",
    "descriptionZh": "用于处理点云的工具集合。",
    "url": "https://rapidlasso.de/product-overview/",
    "categoryId": "3d-applications"
  },
  {
    "id": "wms-1",
    "nameZh": "ArcGIS Server",
    "descriptionZh": "用于企业应用的GIS服务器。",
    "url": "http://server.arcgis.com/",
    "categoryId": "web-map-servers"
  },
  {
    "id": "wms-2",
    "nameZh": "Baremaps",
    "descriptionZh": "用于创建、发布和运营在线地图的工具包。",
    "url": "https://www.baremaps.com/",
    "categoryId": "web-map-servers"
  },
  {
    "id": "wms-3",
    "nameZh": "deegree",
    "descriptionZh": "用于空间数据基础设施的开源软件。",
    "url": "http://www.deegree.org/",
    "categoryId": "web-map-servers"
  },
  {
    "id": "wms-4",
    "nameZh": "GeoDjango",
    "descriptionZh": "使用Python Web框架Django构建的GIS服务器。",
    "url": "https://docs.djangoproject.com/en/3.1/ref/contrib/gis/",
    "categoryId": "web-map-servers"
  },
  {
    "id": "wms-5",
    "nameZh": "GeoNode",
    "descriptionZh": "开源地理空间内容管理系统。",
    "url": "http://geonode.org/",
    "categoryId": "web-map-servers"
  },
  {
    "id": "wms-6",
    "nameZh": "GeoServer",
    "descriptionZh": "用于共享地理空间数据的开源服务器。",
    "url": "http://geoserver.org/",
    "categoryId": "web-map-servers"
  },
  {
    "id": "wms-7",
    "nameZh": "GeoTrellis",
    "descriptionZh": "用于高性能应用的地理数据处理引擎。",
    "url": "https://github.com/locationtech/geotrellis",
    "categoryId": "web-map-servers"
  },
  {
    "id": "wms-8",
    "nameZh": "GeoWebCache",
    "descriptionZh": "用于缓存地图瓦片的Java Web应用。",
    "url": "https://www.geowebcache.org/",
    "categoryId": "web-map-servers"
  },
  {
    "id": "wms-9",
    "nameZh": "MapServer",
    "descriptionZh": "将空间数据和交互式地图应用发布到Web。",
    "url": "http://www.mapserver.org/",
    "categoryId": "web-map-servers"
  },
  {
    "id": "wms-10",
    "nameZh": "Mapnik",
    "descriptionZh": "用C++编写的开源地图工具包。",
    "url": "http://mapnik.org/",
    "categoryId": "web-map-servers"
  },
  {
    "id": "wms-11",
    "nameZh": "MapTiler Server",
    "descriptionZh": "用于自托管矢量瓦片和卫星影像的地图服务器。",
    "url": "https://www.maptiler.com/server/",
    "categoryId": "web-map-servers"
  },
  {
    "id": "wms-12",
    "nameZh": "QGIS Server",
    "descriptionZh": "用于提供QGIS地图服务的FastCGI/CGI应用。",
    "url": "https://docs.qgis.org/1.8/en/docs/user_manual/working_with_ogc/ogc_server_support.html",
    "categoryId": "web-map-servers"
  },
  {
    "id": "wms-13",
    "nameZh": "SuperMap iServer",
    "descriptionZh": "具有2D和3D集成功能的云GIS应用服务器。",
    "url": "https://www.supermap.com/en/html/SuperMap_GIS_products1160212.html",
    "categoryId": "web-map-servers"
  },
  {
    "id": "fe-1",
    "nameZh": "ArcGIS Maps SDK for JavaScript",
    "descriptionZh": "构建由Esri支持的高性能2D和3D地图应用。",
    "url": "https://developers.arcgis.com/javascript/",
    "categoryId": "frontend-framework"
  },
  {
    "id": "fe-2",
    "nameZh": "CesiumJS",
    "descriptionZh": "用于世界级3D地球和地图的开源JavaScript库。",
    "url": "https://cesiumjs.org/",
    "categoryId": "frontend-framework"
  },
  {
    "id": "fe-3",
    "nameZh": "D3.js",
    "descriptionZh": "基于数据操作文档的JavaScript库。",
    "url": "https://d3js.org/",
    "categoryId": "frontend-framework"
  },
  {
    "id": "fe-4",
    "nameZh": "ECharts",
    "descriptionZh": "百度支持的友好数据可视化库。",
    "url": "http://echarts.baidu.com/",
    "categoryId": "frontend-framework"
  },
  {
    "id": "fe-5",
    "nameZh": "Leaflet",
    "descriptionZh": "用于移动友好型交互式地图的开源JavaScript库。",
    "url": "http://leafletjs.com/",
    "categoryId": "frontend-framework"
  },
  {
    "id": "fe-6",
    "nameZh": "Mapbox GL JS",
    "descriptionZh": "从矢量瓦片渲染交互式地图的JavaScript和WebGL库。",
    "url": "https://www.mapbox.com/mapbox-gl-js/api/",
    "categoryId": "frontend-framework"
  },
  {
    "id": "fe-7",
    "nameZh": "MapLibre GL",
    "descriptionZh": "由社区主导的Mapbox GL JS分支。",
    "url": "https://github.com/maplibre/maplibre-gl-js",
    "categoryId": "frontend-framework"
  },
  {
    "id": "fe-8",
    "nameZh": "OpenLayers",
    "descriptionZh": "开源JavaScript地图查看库。",
    "url": "http://openlayers.org/",
    "categoryId": "frontend-framework"
  },
  {
    "id": "fe-9",
    "nameZh": "three.js",
    "descriptionZh": "简化WebGL使用的JavaScript 3D库。",
    "url": "http://threejs.org/",
    "categoryId": "frontend-framework"
  },
  {
    "id": "fe-10",
    "nameZh": "Turf.js",
    "descriptionZh": "用于浏览器和Node.js的高级地理空间分析库。",
    "url": "http://turfjs.org/",
    "categoryId": "frontend-framework"
  },
  {
    "id": "fe-11",
    "nameZh": "L7",
    "descriptionZh": "大规模WebGL驱动的地理空间数据可视化库。",
    "url": "https://github.com/antvis/L7",
    "categoryId": "frontend-framework"
  },
  {
    "id": "fe-12",
    "nameZh": "maptalks.js",
    "descriptionZh": "用于集成2D/3D地图的轻量级可插拔JavaScript库。",
    "url": "https://github.com/maptalks/maptalks.js",
    "categoryId": "frontend-framework"
  },
  {
    "id": "fe-13",
    "nameZh": "OpenGlobus",
    "descriptionZh": "JavaScript 3D地图和地理空间数据可视化引擎。",
    "url": "https://www.openglobus.org/",
    "categoryId": "frontend-framework"
  },
  {
    "id": "sd-1",
    "nameZh": "PostGIS",
    "descriptionZh": "PostgreSQL最先进的开源空间数据库扩展。",
    "url": "http://postgis.net/",
    "categoryId": "spatial-database"
  },
  {
    "id": "sd-2",
    "nameZh": "MongoDB",
    "descriptionZh": "支持地理空间的开源文档数据库。",
    "url": "https://www.mongodb.org/",
    "categoryId": "spatial-database"
  },
  {
    "id": "sd-3",
    "nameZh": "GeoPackage",
    "descriptionZh": "用于SQLite数据库的GeoPackage编码标准。",
    "url": "https://www.geopackage.org/",
    "categoryId": "spatial-database"
  },
  {
    "id": "sd-4",
    "nameZh": "MySQL",
    "descriptionZh": "世界上最流行的开源数据库，支持空间数据。",
    "url": "https://www.mysql.com/",
    "categoryId": "spatial-database"
  },
  {
    "id": "sd-5",
    "nameZh": "Oracle Spatial",
    "descriptionZh": "基于Oracle的高级空间数据分析。",
    "url": "http://www.oracle.com/us/products/database/options/spatial/overview/index.html",
    "categoryId": "spatial-database"
  },
  {
    "id": "sd-6",
    "nameZh": "SpatiaLite",
    "descriptionZh": "支持完整空间功能的轻量级SQL库。",
    "url": "https://www.gaia-gis.it/fossil/libspatialite/index",
    "categoryId": "spatial-database"
  },
  {
    "id": "sd-7",
    "nameZh": "Tile38",
    "descriptionZh": "地理空间数据库、空间索引和实时地理围栏。",
    "url": "https://github.com/tidwall/tile38",
    "categoryId": "spatial-database"
  },
  {
    "id": "sd-8",
    "nameZh": "GeoMesa",
    "descriptionZh": "开源分布式时空数据库。",
    "url": "http://www.geomesa.org/",
    "categoryId": "spatial-database"
  },
  {
    "id": "mobile-1",
    "nameZh": "ArcGIS Maps SDK for Kotlin",
    "descriptionZh": "为Android设备构建2D和3D地图应用。",
    "url": "https://developers.arcgis.com/kotlin/",
    "categoryId": "mobile-tools",
    "subcategory": "Android"
  },
  {
    "id": "mobile-2",
    "nameZh": "Google Maps Android API",
    "descriptionZh": "适用于Android平台的Google Maps API。",
    "url": "https://developers.google.com/maps/android/",
    "categoryId": "mobile-tools",
    "subcategory": "Android"
  },
  {
    "id": "mobile-3",
    "nameZh": "Mapbox Android SDK",
    "descriptionZh": "包含静态矢量和栅格地图、相机使用、导航等API。",
    "url": "https://www.mapbox.com/android-sdk/",
    "categoryId": "mobile-tools",
    "subcategory": "Android"
  },
  {
    "id": "mobile-4",
    "nameZh": "ArcGIS Maps SDK for Swift",
    "descriptionZh": "为iOS设备构建2D和3D地图应用。",
    "url": "https://developers.arcgis.com/swift/",
    "categoryId": "mobile-tools",
    "subcategory": "iOS"
  },
  {
    "id": "mobile-5",
    "nameZh": "Google Maps iOS API",
    "descriptionZh": "适用于iOS平台的Google Maps API。",
    "url": "https://developers.google.com/maps/ios/",
    "categoryId": "mobile-tools",
    "subcategory": "iOS"
  },
  {
    "id": "mobile-6",
    "nameZh": "ArcGIS Maps SDK for .NET",
    "descriptionZh": "使用.NET MAUI用C#为Android和iOS构建原生地图应用。",
    "url": "https://developers.arcgis.com/net/",
    "categoryId": "mobile-tools",
    "subcategory": "Cross-Platform"
  },
  {
    "id": "dt-1",
    "nameZh": "ArcGIS Maps SDK for .NET",
    "descriptionZh": "为Windows、Android和iOS构建2D和3D原生地图应用。",
    "url": "https://developers.arcgis.com/net/",
    "categoryId": "desktop-tools"
  },
  {
    "id": "dt-2",
    "nameZh": "ArcGIS Maps SDK for Java",
    "descriptionZh": "为Windows、Linux和macOS构建2D和3D地图应用。",
    "url": "https://developers.arcgis.com/java/",
    "categoryId": "desktop-tools"
  },
  {
    "id": "dt-3",
    "nameZh": "ArcGIS Maps SDK for Qt",
    "descriptionZh": "使用Qt为多个平台构建2D和3D原生地图应用。",
    "url": "https://developers.arcgis.com/qt/",
    "categoryId": "desktop-tools"
  },
  {
    "id": "dl-1",
    "nameZh": "eo-learn",
    "descriptionZh": "用于Python机器学习的地球观测处理框架。",
    "url": "https://github.com/sentinel-hub/eo-learn",
    "categoryId": "deep-learning",
    "subcategory": "Framework"
  },
  {
    "id": "dl-2",
    "nameZh": "rastervision",
    "descriptionZh": "用于卫星和航空影像深度学习的开源框架。",
    "url": "https://github.com/azavea/raster-vision",
    "categoryId": "deep-learning",
    "subcategory": "Framework"
  },
  {
    "id": "dl-3",
    "nameZh": "robosat",
    "descriptionZh": "航空和卫星影像的语义分割。",
    "url": "https://github.com/mapbox/robosat",
    "categoryId": "deep-learning",
    "subcategory": "Framework"
  },
  {
    "id": "dl-4",
    "nameZh": "Solaris",
    "descriptionZh": "CosmiQ Works地理空间机器学习分析工具包。",
    "url": "https://github.com/CosmiQ/solaris",
    "categoryId": "deep-learning",
    "subcategory": "Framework"
  },
  {
    "id": "dl-5",
    "nameZh": "遥感变化检测资源合集",
    "descriptionZh": "遥感变化检测相关的数据集、代码、论文和竞赛列表。",
    "url": "https://github.com/wenhwu/awesome-remote-sensing-change-detection",
    "categoryId": "deep-learning",
    "subcategory": "Datasets"
  },
  {
    "id": "dl-6",
    "nameZh": "卫星影像数据集资源合集",
    "descriptionZh": "带有计算机视觉标注的卫星影像数据集列表。",
    "url": "https://github.com/chrieke/awesome-satellite-imagery-datasets",
    "categoryId": "deep-learning",
    "subcategory": "Datasets"
  },
  {
    "id": "mr-1",
    "nameZh": "Mapnik",
    "descriptionZh": "用于地图渲染的C++库。",
    "url": "http://mapnik.org/",
    "categoryId": "map-render"
  },
  {
    "id": "mr-2",
    "nameZh": "mapbox-gl-native",
    "descriptionZh": "用于将交互式矢量地图嵌入原生应用的库。",
    "url": "https://github.com/mapbox/mapbox-gl-native",
    "categoryId": "map-render"
  },
  {
    "id": "mr-3",
    "nameZh": "maplibre-gl-native",
    "descriptionZh": "mapbox-gl-native许可证变更后的分支。",
    "url": "https://github.com/maplibre/maplibre-gl-native",
    "categoryId": "map-render"
  },
  {
    "id": "mr-4",
    "nameZh": "Skia",
    "descriptionZh": "用于绘制文本、几何图形和图像的完整2D图形库。",
    "url": "https://skia.org/",
    "categoryId": "map-render"
  },
  {
    "id": "lib-c-1",
    "nameZh": "H3",
    "descriptionZh": "六边形分层地理空间索引系统。",
    "url": "https://github.com/uber/h3",
    "categoryId": "geospatial-library",
    "subcategory": "C"
  },
  {
    "id": "lib-c-2",
    "nameZh": "libpostal",
    "descriptionZh": "用于解析/标准化全球街道地址的C库。",
    "url": "https://github.com/openvenues/libpostal",
    "categoryId": "geospatial-library",
    "subcategory": "C"
  },
  {
    "id": "lib-cpp-1",
    "nameZh": "GDAL",
    "descriptionZh": "用于栅格和矢量数据的地理空间数据抽象库。",
    "url": "http://www.gdal.org/",
    "categoryId": "geospatial-library",
    "subcategory": "C++"
  },
  {
    "id": "lib-cpp-2",
    "nameZh": "GEOS",
    "descriptionZh": "几何引擎 - 开源，JTS的C++移植版。",
    "url": "https://trac.osgeo.org/geos/",
    "categoryId": "geospatial-library",
    "subcategory": "C++"
  },
  {
    "id": "lib-cpp-3",
    "nameZh": "S2 Geometry",
    "descriptionZh": "球面上的计算几何和空间索引。",
    "url": "https://github.com/google/s2geometry",
    "categoryId": "geospatial-library",
    "subcategory": "C++"
  },
  {
    "id": "lib-java-1",
    "nameZh": "GeoTools",
    "descriptionZh": "提供地理空间数据工具的开源Java库。",
    "url": "http://www.geotools.org/",
    "categoryId": "geospatial-library",
    "subcategory": "Java"
  },
  {
    "id": "lib-java-2",
    "nameZh": "JTS Topology Suite",
    "descriptionZh": "2D空间谓词和函数的API。",
    "url": "http://www.vividsolutions.com/jts/jtshome.htm",
    "categoryId": "geospatial-library",
    "subcategory": "Java"
  },
  {
    "id": "lib-python-1",
    "nameZh": "Shapely",
    "descriptionZh": "用于几何对象操作和分析的Python包。",
    "url": "https://shapely.readthedocs.io/",
    "categoryId": "geospatial-library",
    "subcategory": "Python"
  },
  {
    "id": "lib-python-2",
    "nameZh": "Fiona",
    "descriptionZh": "用于读写空间数据格式的Python库。",
    "url": "https://fiona.readthedocs.io/",
    "categoryId": "geospatial-library",
    "subcategory": "Python"
  },
  {
    "id": "lib-python-3",
    "nameZh": "Geopandas",
    "descriptionZh": "用于处理地理空间数据的Python库。",
    "url": "https://geopandas.org/",
    "categoryId": "geospatial-library",
    "subcategory": "Python"
  },
  {
    "id": "lib-go-1",
    "nameZh": "orb",
    "descriptionZh": "用于在Go中处理2D地理和平面几何数据的包。",
    "url": "https://github.com/paulmach/orb",
    "categoryId": "geospatial-library",
    "subcategory": "Go"
  },
  {
    "id": "lib-go-2",
    "nameZh": "go-geom",
    "descriptionZh": "用于处理几何图形的Go库。",
    "url": "https://github.com/twpayne/go-geom",
    "categoryId": "geospatial-library",
    "subcategory": "Go"
  },
  {
    "id": "os-1",
    "nameZh": "OGC标准",
    "descriptionZh": "开放地理空间联盟标准，用于地理空间数据交换。",
    "url": "https://www.ogc.org/",
    "categoryId": "open-standards"
  },
  {
    "id": "os-2",
    "nameZh": "WMS标准",
    "descriptionZh": "用于提供地理空间地图图像的Web地图服务标准。",
    "url": "https://www.ogc.org/standards/wms",
    "categoryId": "open-standards"
  },
  {
    "id": "os-3",
    "nameZh": "WMTS标准",
    "descriptionZh": "用于提供地图瓦片的Web地图瓦片服务标准。",
    "url": "https://www.ogc.org/standards/wmts",
    "categoryId": "open-standards"
  },
  {
    "id": "cloud-1",
    "nameZh": "Google Maps Platform",
    "descriptionZh": "面向开发者的云地图服务平台。",
    "url": "https://cloud.google.com/maps-platform/",
    "categoryId": "cloud-service"
  },
  {
    "id": "cloud-2",
    "nameZh": "AWS Location Service",
    "descriptionZh": "亚马逊云服务的地理空间服务。",
    "url": "https://aws.amazon.com/location/",
    "categoryId": "cloud-service"
  },
  {
    "id": "cloud-3",
    "nameZh": "Azure Maps",
    "descriptionZh": "微软Azure地理空间服务。",
    "url": "https://azure.microsoft.com/en-us/services/azure-maps/",
    "categoryId": "cloud-service"
  },
  {
    "id": "conf-1",
    "nameZh": "FOSS4G",
    "descriptionZh": "地理空间开源软件会议。",
    "url": "https://www.foss4g.org/",
    "categoryId": "conference"
  },
  {
    "id": "data-1",
    "nameZh": "OpenStreetMap",
    "descriptionZh": "免费可编辑的世界地图。",
    "url": "https://www.openstreetmap.org/",
    "categoryId": "data"
  },
  {
    "id": "data-2",
    "nameZh": "NASA地球观测系统",
    "descriptionZh": "NASA卫星影像和地理空间数据。",
    "url": "https://earthdata.nasa.gov/",
    "categoryId": "data"
  },
  {
    "id": "data-3",
    "nameZh": "USGS地球资源探测",
    "descriptionZh": "USGS卫星和航空影像数据。",
    "url": "https://earthexplorer.usgs.gov/",
    "categoryId": "data"
  },
  {
    "id": "news-1",
    "nameZh": "Geoawesomeness",
    "descriptionZh": "地理空间技术新闻和资源网站。",
    "url": "https://geoawesomeness.com/",
    "categoryId": "news"
  },
  {
    "id": "news-2",
    "nameZh": "GIS Lounge",
    "descriptionZh": "GIS新闻、教程和资源网站。",
    "url": "https://www.gislounge.com/",
    "categoryId": "news"
  },
  {
    "id": "amazing-1",
    "nameZh": "Earth Trekkers",
    "descriptionZh": "展示环球旅行的交互式地图。",
    "url": "https://earthtrekkers.com/",
    "categoryId": "amazing-maps"
  },
  {
    "id": "amazing-2",
    "nameZh": "Mapbox",
    "descriptionZh": "面向开发者的自定义地图和位置数据服务。",
    "url": "https://www.mapbox.com/",
    "categoryId": "amazing-maps"
  },
  {
    "id": "data-4",
    "nameZh": "Natural Earth",
    "descriptionZh": "免费矢量与栅格底图数据，提供 1:10m、1:50m、1:110m 多种比例尺，适合制图与教学。",
    "url": "https://www.naturalearthdata.com/",
    "categoryId": "data"
  },
  {
    "id": "data-5",
    "nameZh": "GADM 全球行政区划",
    "descriptionZh": "全球行政边界空间数据库，细至省/市/县级，提供 shp、geojson 等多种格式。",
    "url": "https://gadm.org/",
    "categoryId": "data"
  },
  {
    "id": "data-6",
    "nameZh": "哥白尼数据空间",
    "descriptionZh": "欧盟哥白尼计划官方平台，免费获取 Sentinel-1/2/3 等卫星影像并提供云端分析。",
    "url": "https://dataspace.copernicus.eu/",
    "categoryId": "data"
  },
  {
    "id": "data-7",
    "nameZh": "OpenTopography",
    "descriptionZh": "提供高分辨率地形数据（LiDAR/DEM）在线访问与处理工具，适合地形分析。",
    "url": "https://opentopography.org/",
    "categoryId": "data"
  },
  {
    "id": "data-8",
    "nameZh": "WorldPop 人口数据",
    "descriptionZh": "全球高分辨率人口分布栅格数据，可按年龄、性别、年份分层，适合人口与公卫研究。",
    "url": "https://www.worldpop.org/",
    "categoryId": "data"
  },
  {
    "id": "data-9",
    "nameZh": "GeoBoundaries",
    "descriptionZh": "全球最大的开放行政边界数据库，汇集各国最权威的各级边界数据。",
    "url": "https://www.geoboundaries.org/",
    "categoryId": "data"
  },
  {
    "id": "data-10",
    "nameZh": "Geofabrik",
    "descriptionZh": "按区域/国家每日提取的 OpenStreetMap 数据下载站，方便获取指定范围 OSM 数据。",
    "url": "https://download.geofabrik.de/",
    "categoryId": "data"
  },
  {
    "id": "data-11",
    "nameZh": "ESA WorldCover",
    "descriptionZh": "欧空局发布的全球 10 米分辨率土地覆盖数据，分类细致，适合生态与变化监测。",
    "url": "https://viewer.esa-worldcover.org/worldcover/",
    "categoryId": "data"
  },
  {
    "id": "dp-1",
    "nameZh": "天地图",
    "descriptionZh": "国家地理信息公共服务平台，自然资源部权威底图、影像与 POI 数据，国内 GIS 项目首选。",
    "url": "https://www.tianditu.gov.cn/",
    "categoryId": "domestic-platforms"
  },
  {
    "id": "dp-2",
    "nameZh": "高德地图开放平台",
    "descriptionZh": "高德地图开放平台，提供地图、定位、路径规划与实时路况，商业 LBS 应用首选。",
    "url": "https://lbs.amap.com/",
    "categoryId": "domestic-platforms"
  },
  {
    "id": "dp-3",
    "nameZh": "百度地图开放平台",
    "descriptionZh": "百度地图开放平台，提供地图、定位、轨迹与地理大数据服务。",
    "url": "https://lbsyun.baidu.com/",
    "categoryId": "domestic-platforms"
  },
  {
    "id": "dp-4",
    "nameZh": "阿里云 DataV.GeoAtlas",
    "descriptionZh": "阿里云 DataV 地理小工具，提供中国行政区划 GeoJSON 在线下载与地图可视化。",
    "url": "https://datav.aliyun.com/portal/school/atlas/area_selector",
    "categoryId": "domestic-platforms"
  },
  {
    "id": "dp-5",
    "nameZh": "腾讯位置服务",
    "descriptionZh": "腾讯位置服务，提供地图、周边搜索、路线与定位能力，微信生态集成友好。",
    "url": "https://lbs.qq.com/",
    "categoryId": "domestic-platforms"
  },
  {
    "id": "dp-6",
    "nameZh": "全国地理信息资源目录服务系统",
    "descriptionZh": "国家基础地理信息中心维护，提供 1:100 万、1:25 万基础地理数据库与全球地表覆盖数据。",
    "url": "https://www.webmap.cn",
    "categoryId": "domestic-platforms"
  },
  {
    "id": "amazing-3",
    "nameZh": "kepler.gl",
    "descriptionZh": "Uber 开源的大规模地理空间数据可视化工具，支持海量点/线/面高效渲染。",
    "url": "https://kepler.gl/",
    "categoryId": "amazing-maps"
  },
  {
    "id": "amazing-4",
    "nameZh": "GeoJSON.io",
    "descriptionZh": "在线创建、编辑与分享 GeoJSON 的轻量工具，适合快速画范围、做原型。",
    "url": "https://geojson.io/",
    "categoryId": "amazing-maps"
  },
  {
    "id": "amazing-5",
    "nameZh": "OpenTopoMap",
    "descriptionZh": "基于 OSM 与 SRTM 的免费交互式地形地图，带等高线，适合户外与地形参考。",
    "url": "https://opentopomap.org/",
    "categoryId": "amazing-maps"
  },
  {
    "id": "amazing-6",
    "nameZh": "Mapillary",
    "descriptionZh": "众包街景影像平台，利用 AI 提取道路要素，适合街景与地图更新。",
    "url": "https://www.mapillary.com/",
    "categoryId": "amazing-maps"
  },
  {
    "id": "amazing-7",
    "nameZh": "Felt",
    "descriptionZh": "协作式无代码在线地图制作平台，拖拽即可出图，适合快速做专题地图。",
    "url": "https://felt.com/",
    "categoryId": "amazing-maps"
  },
  {
    "id": "amazing-8",
    "nameZh": "earth.nullschool.net",
    "descriptionZh": "全球风场、洋流与天气的交互式可视化，科学美感兼具，常用于科普展示。",
    "url": "https://earth.nullschool.net/",
    "categoryId": "amazing-maps"
  },
  {
    "id": "amazing-9",
    "nameZh": "Windy",
    "descriptionZh": "风、天气与极端天气预报可视化，气象爱好者与户外玩家常用。",
    "url": "https://www.windy.com/",
    "categoryId": "amazing-maps"
  },
  {
    "id": "amazing-10",
    "nameZh": "MapChart",
    "descriptionZh": "在线自定义着色地图工具，做世界/各国分区配色图非常方便。",
    "url": "https://mapchart.net/",
    "categoryId": "amazing-maps"
  },
  {
    "id": "news-3",
    "nameZh": "GIS Geography",
    "descriptionZh": "GIS 教程、软件评测与遥感指南类博客，内容通俗实用。",
    "url": "https://gisgeography.com/",
    "categoryId": "news"
  },
  {
    "id": "news-4",
    "nameZh": "Geospatial World",
    "descriptionZh": "全球地理空间产业新闻与分析，关注行业趋势与企业动态。",
    "url": "https://www.geospatialworld.net/",
    "categoryId": "news"
  },
  {
    "id": "os-4",
    "nameZh": "WFS 标准",
    "descriptionZh": "Web 要素服务标准，用于以矢量要素形式获取和编辑地理数据。",
    "url": "https://www.ogc.org/standards/wfs",
    "categoryId": "open-standards"
  },
  {
    "id": "os-5",
    "nameZh": "GeoJSON",
    "descriptionZh": "编码地理数据结构的开放格式，Web 地图前后端交换事实标准。",
    "url": "https://geojson.org/",
    "categoryId": "open-standards"
  },
  {
    "id": "os-6",
    "nameZh": "CityGML 标准",
    "descriptionZh": "用于表达三维城市与景观模型的 OGC 标准，数字孪生常用。",
    "url": "https://www.ogc.org/standards/citygml",
    "categoryId": "open-standards"
  },
  {
    "id": "os-7",
    "nameZh": "KML 标准",
    "descriptionZh": "用于在 Google Earth 等地球浏览器中标注地理信息的标记语言。",
    "url": "https://www.ogc.org/standards/kml",
    "categoryId": "open-standards"
  },
  {
    "id": "cloud-4",
    "nameZh": "阿里云",
    "descriptionZh": "阿里云，提供空间计算、DataV 可视化与地图相关云服务。",
    "url": "https://www.aliyun.com/",
    "categoryId": "cloud-service"
  },
  {
    "id": "cloud-5",
    "nameZh": "腾讯云",
    "descriptionZh": "腾讯云，提供位置服务、地图与空间数据相关能力。",
    "url": "https://cloud.tencent.com/",
    "categoryId": "cloud-service"
  },
  {
    "id": "cloud-6",
    "nameZh": "Sentinel Hub",
    "descriptionZh": "按需获取多星座卫星影像的 API 服务，EO Browser 同系产品。",
    "url": "https://www.sentinel-hub.com/",
    "categoryId": "cloud-service"
  },
  {
    "id": "cloud-7",
    "nameZh": "Planet",
    "descriptionZh": "提供全球每日卫星影像与地理空间洞察，遥感商业卫星领军。",
    "url": "https://www.planet.com/",
    "categoryId": "cloud-service"
  },
  {
    "id": "3d-10",
    "nameZh": "deck.gl",
    "descriptionZh": "WebGL 驱动的大规模地理空间数据可视化框架，能与 Mapbox/MapLibre 叠加。",
    "url": "https://deck.gl/",
    "categoryId": "3d-applications"
  },
  {
    "id": "3d-11",
    "nameZh": "Potree",
    "descriptionZh": "面向海量 LiDAR 点云的 WebGL 渲染器，点云可视化利器。",
    "url": "https://potree.org/",
    "categoryId": "3d-applications"
  },
  {
    "id": "3d-12",
    "nameZh": "Cesium ion",
    "descriptionZh": "Cesium 官方云平台，提供 3D Tiles 切片与全球地形/影像流送服务。",
    "url": "https://cesium.com/ion/",
    "categoryId": "3d-applications"
  },
  {
    "id": "rs-11",
    "nameZh": "EO Browser",
    "descriptionZh": "哥白尼 EO Browser，浏览器内浏览与分析多源卫星影像，免下载预览。",
    "url": "https://apps.sentinel-hub.com/eo-browser/",
    "categoryId": "remote-sensing"
  },
  {
    "id": "rs-12",
    "nameZh": "吉林一号（长光卫星）",
    "descriptionZh": "长光卫星运营的吉林一号商业遥感星座，高分辨率光学影像。",
    "url": "https://www.jilin1.com/",
    "categoryId": "remote-sensing"
  },
  {
    "id": "rs-13",
    "nameZh": "中国资源卫星应用中心",
    "descriptionZh": "中国资源卫星应用中心，提供国产陆地观测卫星数据服务。",
    "url": "https://www.cresda.com/",
    "categoryId": "remote-sensing"
  },
  {
    "id": "conf-2",
    "nameZh": "State of the Map",
    "descriptionZh": "OpenStreetMap 全球年度大会，社区与制图技术交流盛会。",
    "url": "https://stateofthemap.org/",
    "categoryId": "conference"
  },
  {
    "id": "conf-3",
    "nameZh": "中国地理信息产业协会",
    "descriptionZh": "中国地理信息产业协会，主办中国地理信息产业大会，行业风向标。",
    "url": "https://www.cagis.org.cn/",
    "categoryId": "conference"
  },
  {
    "id": "learn-1",
    "nameZh": "OSGeo 开源地理空间基金会",
    "descriptionZh": "开源地理空间基金会，QGIS/GDAL/PostGIS 等项目的官方组织与社区。",
    "url": "https://www.osgeo.org/",
    "categoryId": "learning"
  },
  {
    "id": "learn-2",
    "nameZh": "菜鸟教程",
    "descriptionZh": "菜鸟教程，覆盖 WebGIS 常用的 Python/JS/SQL 入门，地信开发查漏补缺。",
    "url": "https://www.runoob.com/",
    "categoryId": "learning"
  },
  {
    "id": "learn-3",
    "nameZh": "GIS Stack Exchange",
    "descriptionZh": "GIS 与地理空间从业者的问答社区，踩坑排错第一站。",
    "url": "https://gis.stackexchange.com/",
    "categoryId": "learning"
  },
  {
    "id": "learn-4",
    "nameZh": "Awesome GIS",
    "descriptionZh": "GitHub 上精选的 GIS 工具、数据与学习资源清单，导航站同源好物。",
    "url": "https://github.com/sshuair/awesome-gis",
    "categoryId": "learning"
  },
  {
    "id": "dp-7",
    "nameZh": "91卫图助手",
    "descriptionZh": "91卫图助手，国产多源在线地图与影像下载工具，支持高清卫片与历史影像。",
    "url": "https://www.91weitu.com/",
    "categoryId": "domestic-platforms"
  },
  {
    "id": "dp-8",
    "nameZh": "BIGEMAP 大地图",
    "descriptionZh": "BIGEMAP，国产 GIS 软件，支持多源地图下载、编辑与离线浏览，工程常用。",
    "url": "https://www.bigemap.com/",
    "categoryId": "domestic-platforms"
  },
  {
    "id": "dp-9",
    "nameZh": "水经注",
    "descriptionZh": "水经注万能地图下载器，国产一站式地图下载，覆盖卫片、地形与矢量数据。",
    "url": "https://www.rivermap.cn/",
    "categoryId": "domestic-platforms"
  },
  {
    "id": "data-12",
    "nameZh": "OpenAerialMap",
    "descriptionZh": "开放航拍与无人机影像库，采用开放许可，可直接检索与下载使用。",
    "url": "https://openaerialmap.org/",
    "categoryId": "data"
  },
  {
    "id": "amazing-11",
    "nameZh": "Wikimapia",
    "descriptionZh": "众包可编辑世界地图，标注详尽，适合查地名与地物分布。",
    "url": "https://wikimapia.org/",
    "categoryId": "amazing-maps"
  },
  {
    "id": "cloud-8",
    "nameZh": "CARTO",
    "descriptionZh": "CARTO，位置智能与地图数据可视化云平台，企业级空间分析常用。",
    "url": "https://carto.com/",
    "categoryId": "cloud-service"
  },
  {
    "id": "gis-19",
    "nameZh": "QGIS 插件库",
    "descriptionZh": "QGIS 官方插件仓库，数千个扩展插件，桌面 GIS 能力的重要来源。",
    "url": "https://plugins.qgis.org/",
    "categoryId": "gis-software"
  },
  {
    "id": "learn-5",
    "nameZh": "宾州州立大学 开放 GIS 课程",
    "descriptionZh": "宾州州立大学提供的免费在线 GIS 课程与证书项目，体系完整。",
    "url": "https://www.e-education.psu.edu/",
    "categoryId": "learning"
  },
  {
    "id": "learn-6",
    "nameZh": "Esri 培训学院",
    "descriptionZh": "Esri 官方培训学院，覆盖 ArcGIS 与通用 GIS 技能的课程体系。",
    "url": "https://www.esri.com/training/",
    "categoryId": "learning"
  },
  {
    "id": "mobile-7",
    "nameZh": "Mapbox iOS SDK",
    "descriptionZh": "Mapbox 面向 iOS 的矢量地图与导航 SDK，平衡移动开发分类的 ArcGIS 占比。",
    "url": "https://www.mapbox.com/ios-sdk/",
    "categoryId": "mobile-tools",
    "subcategory": "iOS"
  },
  {
    "id": "3d-13",
    "nameZh": "Mapbox Unity SDK",
    "descriptionZh": "Mapbox 面向 Unity 的 3D 地图 SDK，可在游戏引擎内构建地理空间场景。",
    "url": "https://www.mapbox.com/unity/",
    "categoryId": "3d-applications"
  }
];
