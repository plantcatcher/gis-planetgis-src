import zipfile, os
zp = r"D:/01 资料下载/地理数据/GS(2024)0650-SHP.zip"
names = zipfile.ZipFile(zp).namelist()
names = sorted(names)
with open(r"D:/WorkSpace/00PlanetGIS源码/_list_out.txt", "w", encoding="utf-8") as f:
    f.write("count=%d\n" % len(names))
    for n in names:
        f.write(n + "\n")
print("ok", len(names))
