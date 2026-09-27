import zipfile, os, struct, sys, io

_buf = io.StringIO()
_realout = sys.stdout
sys.stdout = _buf

zp = r'D:\01 资料下载\地理数据\GS(2024)0650-SHP.zip'
print('ZIP 路径 :', zp)
print('ZIP 大小 :', round(os.path.getsize(zp)/1024/1024, 2), 'MB', '(', os.path.getsize(zp), 'bytes )')

with zipfile.ZipFile(zp) as z:
    names = z.namelist()
    print('条目总数 :', len(names))
    # 按扩展名归类
    exts = {}
    for n in names:
        e = os.path.splitext(n)[1].lower()
        exts[e] = exts.get(e, 0) + 1
    print('扩展名分布:', exts)
    print('\n--- 文件清单（前 200）---')
    for n in names[:200]:
        print('  ', n)
    if len(names) > 200:
        print('  ... 共', len(names), '条')

    # 解析每个图层组（同名 .shp/.shx/.dbf/.prj）
    print('\n--- 图层解析 ---')
    bases = {}
    for n in names:
        base, ext = os.path.splitext(n)
        if ext.lower() in ('.shp', '.shx', '.dbf', '.prj', '.cpg', '.xml', '.sbn', '.sbx'):
            bases.setdefault(base, set()).add(ext.lower())

    for base in sorted(bases):
        print('\n图层:', base)
        # prj
        prj = base + '.prj'
        if prj in names:
            try:
                data = z.read(prj).decode('utf-8', 'ignore').strip()
                print('  PRJ:', data[:200])
            except Exception as e:
                print('  PRJ 读取失败:', e)
        # dbf 字段与记录数
        dbf = base + '.dbf'
        if dbf in names:
            try:
                b = z.read(dbf)
                if len(b) >= 32:
                    nrec = struct.unpack('<I', b[4:8])[0]
                    hlen = struct.unpack('<H', b[8:10])[0]
                    rlen = struct.unpack('<H', b[10:12])[0]
                    fields = []
                    off = 32
                    while off + 1 < hlen and off + 32 <= len(b):
                        name = b[off:off+11].split(b'\x00')[0].decode('gbk', 'ignore')
                        ftype = chr(b[off+11])
                        flen = b[off+16]
                        if name == '':
                            break
                        fields.append((name, ftype, flen))
                        off += 32
                    print('  记录数:', nrec, ' 记录长:', rlen, ' 字段:', fields[:30])
            except Exception as e:
                print('  DBF 解析失败:', e)

sys.stdout = _realout
open(r'D:\WorkSpace\00PlanetGIS源码\_inspect_out.txt', 'w', encoding='utf-8').write(_buf.getvalue())
