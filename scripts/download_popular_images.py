import os
import re
import ssl
import time
import urllib.request
import urllib.parse
import subprocess

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'assets', 'products')
os.makedirs(OUT_DIR, exist_ok=True)

# List of all key popular fragrances to fetch
PERFUMES = [
    # Tom Ford
    ("Tom Ford Black Orchid", "tom-ford-black-orchid.jpg", ["tom ford", "black orchid"]),
    ("Tom Ford Lost Cherry", "tom-ford-lost-cherry.jpg", ["tom ford", "lost cherry"]),
    ("Tom Ford Tobacco Vanille", "tom-ford-tobacco-vanille.jpg", ["tom ford", "tobacco vanille"]),
    ("Tom Ford Oud Wood", "tom-ford-oud-wood.jpg", ["tom ford", "oud wood"]),
    ("Tom Ford Tuscan Leather", "tom-ford-tuscan-leather.jpg", ["tom ford", "tuscan leather"]),
    ("Tom Ford Ombre Leather", "tom-ford-ombre-leather.jpg", ["tom ford", "ombre leather"]),
    ("Tom Ford Bitter Peach", "tom-ford-bitter-peach.jpg", ["tom ford", "bitter peach"]),
    ("Tom Ford Soleil Blanc", "tom-ford-soleil-blanc.jpg", ["tom ford", "soleil blanc"]),
    ("Tom Ford Neroli Portofino", "tom-ford-neroli-portofino.jpg", ["tom ford", "neroli portofino"]),
    ("Tom Ford Beau de Jour", "tom-ford-beau-de-jour.jpg", ["tom ford", "beau de jour"]),
    ("Tom Ford Ebene Fume", "tom-ford-ebene-fume.jpg", ["tom ford", "ebene fume"]),
    ("Tom Ford Rose Prick", "tom-ford-rose-prick.jpg", ["tom ford", "rose prick"]),
    ("Tom Ford Fucking Fabulous", "tom-ford-fucking-fabulous.jpg", ["tom ford", "fabulous"]),
    ("Tom Ford Grey Vetiver", "tom-ford-grey-vetiver.jpg", ["tom ford", "grey vetiver"]),
    ("Tom Ford Noir Extreme", "tom-ford-noir-extreme.jpg", ["tom ford", "noir extreme"]),
    
    # Versace
    ("Versace Eros Pour Homme", "versace-eros.jpg", ["versace", "eros"]),
    ("Versace Eros Flame", "versace-eros-flame.jpg", ["versace", "flame"]),
    ("Versace Dylan Blue", "versace-dylan-blue.jpg", ["versace", "dylan blue"]),
    ("Versace Bright Crystal", "versace-bright-crystal.jpg", ["versace", "bright crystal"]),
    ("Versace Crystal Noir", "versace-crystal-noir.jpg", ["versace", "crystal noir"]),
    ("Versace Man Eau Fraiche", "versace-man-eau-fraiche.jpg", ["versace", "eau fraiche"]),
    ("Versace Pour Homme", "versace-pour-homme.jpg", ["versace", "pour homme"]),
    ("Versace Versense", "versace-versense.jpg", ["versace", "versense"]),
    ("Versace Yellow Diamond", "versace-yellow-diamond.jpg", ["versace", "yellow diamond"]),
    
    # Boss / Hugo Boss
    ("Hugo Boss Bottled", "boss-bottled.jpg", ["boss", "bottled"]),
    ("Hugo Boss The Scent", "boss-the-scent.jpg", ["boss", "the scent"]),
    ("Hugo Boss Hugo Man", "boss-hugo-man.jpg", ["boss", "hugo men"]),
    ("Hugo Boss Alive", "boss-alive.jpg", ["boss", "alive"]),
    ("Hugo Boss Femme", "boss-femme.jpg", ["boss", "femme"]),
    ("Hugo Boss Orange", "boss-orange.jpg", ["boss", "orange"]),
    
    # Afnan
    ("Afnan 9PM", "afnan-9pm.jpg", ["afnan", "9pm"]),
    ("Afnan 9AM Dive", "afnan-9am.jpg", ["afnan", "9am"]),
    ("Afnan Supremacy Silver", "afnan-supremacy-silver.jpg", ["afnan", "supremacy silver"]),
    ("Afnan Supremacy Not Only Intense", "afnan-supremacy-noi.jpg", ["afnan", "not only intense"]),
    ("Afnan Supremacy In Oud", "afnan-supremacy-in-oud.jpg", ["afnan", "in oud"]),
    ("Afnan Supremacy In Heaven", "afnan-supremacy-in-heaven.jpg", ["afnan", "in heaven"]),
    ("Afnan Rare Carbon", "afnan-rare-carbon.jpg", ["afnan", "rare carbon"]),
    ("Afnan Turathi Blue", "afnan-turathi-blue.jpg", ["afnan", "turathi blue"]),
    
    # Armaf
    ("Armaf Club de Nuit Intense Man", "armaf-club-de-nuit.jpg", ["armaf", "club de nuit"]),
    ("Armaf Club de Nuit Milestone", "armaf-milestone.jpg", ["armaf", "milestone"]),
    ("Armaf Club de Nuit Sillage", "armaf-sillage.jpg", ["armaf", "sillage"]),
    ("Armaf Club de Nuit Untold", "armaf-untold.jpg", ["armaf", "untold"]),
    ("Armaf Club de Nuit Blue Iconic", "armaf-iconic.jpg", ["armaf", "iconic"]),
    
    # Burberry
    ("Burberry Hero", "burberry-hero.jpg", ["burberry", "hero"]),
    ("Burberry Goddess", "burberry-goddess.jpg", ["burberry", "goddess"]),
    ("Burberry Her", "burberry-her.jpg", ["burberry", "her"]),
    ("Burberry London", "burberry-london.jpg", ["burberry", "london"]),
    ("Burberry Brit", "burberry-brit.jpg", ["burberry", "brit"]),
    ("Burberry Touch", "burberry-touch.jpg", ["burberry", "touch"]),
    ("Burberry Weekend", "burberry-weekend.jpg", ["burberry", "weekend"]),
    
    # Mancera
    ("Mancera Cedrat Boise", "mancera-cedrat-boise.jpg", ["mancera", "cedrat boise"]),
    ("Mancera Red Tobacco", "mancera-red-tobacco.jpg", ["mancera", "red tobacco"]),
    ("Mancera Roses Vanille", "mancera-roses-vanille.jpg", ["mancera", "roses vanille"]),
    ("Mancera Instant Crush", "mancera-instant-crush.jpg", ["mancera", "instant crush"]),
    ("Mancera Amore Caffe", "mancera-amore-caffe.jpg", ["mancera", "amore caffe"]),
    ("Mancera Tonka Cola", "mancera-tonka-cola.jpg", ["mancera", "tonka cola"]),
    ("Mancera Hindu Kush", "mancera-hindu-kush.jpg", ["mancera", "hindu kush"]),
    ("Mancera Holidays", "mancera-holidays.jpg", ["mancera", "holidays"]),
    
    # Clive Christian
    ("Clive Christian No 1", "clive-christian-no1.jpg", ["clive christian", "no 1"]),
    ("Clive Christian 1872", "clive-christian-1872.jpg", ["clive christian", "1872"]),
    ("Clive Christian Crab Apple Blossom", "clive-christian-crab-apple.jpg", ["clive christian", "crab apple"]),
    ("Clive Christian X", "clive-christian-x.jpg", ["clive christian", "x"]),
    ("Clive Christian Matsukita", "clive-christian-matsukita.jpg", ["clive christian", "matsukita"]),
    ("Clive Christian Jump Up and Kiss Me", "clive-christian-jump-up.jpg", ["clive christian", "jump up"]),
    ("Clive Christian C Woody Leather", "clive-christian-c-woody.jpg", ["clive christian", "woody leather"]),
    
    # Dior
    ("Christian Dior Sauvage", "dior-sauvage.jpg", ["dior", "sauvage"]),
    ("Christian Dior Homme", "dior-homme.jpg", ["dior", "homme"]),
    ("Christian Dior Fahrenheit", "dior-fahrenheit.jpg", ["dior", "fahrenheit"]),
    ("Christian Dior J Adore", "dior-jadore.jpg", ["dior", "j adore"]),
    ("Christian Dior Miss Dior", "dior-miss-dior.jpg", ["dior", "miss dior"]),
    ("Christian Dior Hypnotic Poison", "dior-hypnotic-poison.jpg", ["dior", "hypnotic poison"]),
    
    # Thomas Kosmala
    ("Thomas Kosmala No 4 Apres l Amour", "thomas-kosmala-no4.jpg", ["thomas kosmala", "apres l amour"]),
    ("Thomas Kosmala No 4 Candy", "thomas-kosmala-candy.jpg", ["thomas kosmala", "candy"]),
    ("Thomas Kosmala No 10 Desir du Coeur", "thomas-kosmala-no10.jpg", ["thomas kosmala", "desir du coeur"]),
    ("Thomas Kosmala No 7 Le Sel De La Terre", "thomas-kosmala-no7.jpg", ["thomas kosmala", "no 7"]),
    ("Thomas Kosmala No 2 Seve Nouvelle", "thomas-kosmala-no2.jpg", ["thomas kosmala", "no 2"]),
    ("Thomas Kosmala No 3 Crepuscule Ardent", "thomas-kosmala-no3.jpg", ["thomas kosmala", "no 3"]),
    
    # Creed
    ("Creed Aventus", "creed-aventus.jpg", ["creed", "aventus"]),
    ("Creed Silver Mountain Water", "creed-silver-mountain.jpg", ["creed", "silver mountain"]),
    ("Creed Green Irish Tweed", "creed-green-irish-tweed.jpg", ["creed", "green irish tweed"]),
    ("Creed Millesime Imperial", "creed-millesime-imperial.jpg", ["creed", "millesime imperial"]),
    ("Creed Aventus for Her", "creed-aventus-for-her.jpg", ["creed", "aventus for her"]),
    ("Creed Virgin Island Water", "creed-virgin-island.jpg", ["creed", "virgin island"]),
    
    # Kilian
    ("Kilian Angels Share", "kilian-angels-share.jpg", ["kilian", "angels share"]),
    ("Kilian Good Girl Gone Bad", "kilian-good-girl-gone-bad.jpg", ["kilian", "good girl"]),
    ("Kilian Black Phantom", "kilian-black-phantom.jpg", ["kilian", "black phantom"]),
    ("Kilian Love Don't Be Shy", "kilian-love-dont-be-shy.jpg", ["kilian", "love"]),
    
    # MFK
    ("Maison Francis Kurkdjian Baccarat Rouge 540", "mfk-baccarat-540.jpg", ["baccarat"]),
    ("Maison Francis Kurkdjian Grand Soir", "mfk-grand-soir.jpg", ["grand soir"]),
    ("Maison Francis Kurkdjian Gentle Fluidity", "mfk-gentle-fluidity.jpg", ["gentle fluidity"]),
    
    # Xerjoff
    ("Xerjoff Erba Pura", "xerjoff-erba-pura.jpg", ["xerjoff", "erba pura"]),
    ("Xerjoff Naxos", "xerjoff-naxos.jpg", ["xerjoff", "naxos"]),
    ("Xerjoff Alexandria II", "xerjoff-alexandria-ii.jpg", ["xerjoff", "alexandria"]),
    ("Xerjoff Casamorati Lira", "xerjoff-casamorati-lira.jpg", ["lira"]),
    ("Xerjoff Tony Iommi", "xerjoff-tony-iommi.jpg", ["tony iommi"]),
    
    # Lattafa
    ("Lattafa Khamrah", "lattafa-khamrah.jpg", ["lattafa", "khamrah"]),
    ("Lattafa Yara", "lattafa-yara.jpg", ["lattafa", "yara"]),
    ("Lattafa Asad", "lattafa-asad.jpg", ["lattafa", "asad"]),
    ("Lattafa Badee Al Oud", "lattafa-badee-al-oud.jpg", ["lattafa", "bade"]),
    
    # Montale
    ("Montale Arabians Tonka", "montale-arabians-tonka.jpg", ["montale", "arabians tonka"]),
    ("Montale Chocolate Greedy", "montale-chocolate-greedy.jpg", ["montale", "chocolate greedy"]),
    ("Montale Intense Cafe", "montale-intense-cafe.jpg", ["montale", "intense cafe"]),
    ("Montale Roses Musk", "montale-roses-musk.jpg", ["montale", "roses musk"]),
    ("Montale Black Aoud", "montale-black-aoud.jpg", ["montale", "black aoud"]),
    ("Montale Soleil de Capri", "montale-soleil-de-capri.jpg", ["montale", "soleil de capri"]),
    ("Montale Wild Pears", "montale-wild-pears.jpg", ["montale", "wild pears"]),
    
    # Initio
    ("Initio Parfums Prives Side Effect", "initio-side-effect.jpg", ["initio", "side effect"]),
    ("Initio Parfums Prives Oud For Greatness", "initio-oud-for-greatness.jpg", ["initio", "oud for greatness"]),
    ("Initio Parfums Prives Musk Therapy", "initio-musk-therapy.jpg", ["initio", "musk therapy"]),
    ("Initio Parfums Prives Atomic Rose", "initio-atomic-rose.jpg", ["initio", "atomic rose"]),
    
    # Byredo
    ("Byredo Bal d Afrique", "byredo-bal-dafrique.jpg", ["byredo", "bal d afrique"]),
    ("Byredo Blanche", "byredo-blanche.jpg", ["byredo", "blanche"]),
    ("Byredo Gypsy Water", "byredo-gypsy-water.jpg", ["byredo", "gypsy water"]),
    ("Byredo Mojave Ghost", "byredo-mojave-ghost.jpg", ["byredo", "mojave ghost"]),
    
    # Parfums de Marly
    ("Parfums de Marly Layton", "pdm-layton.jpg", ["marly", "layton"]),
    ("Parfums de Marly Delina", "pdm-delina.jpg", ["marly", "delina"]),
    ("Parfums de Marly Herod", "pdm-herod.jpg", ["marly", "herod"]),
    ("Parfums de Marly Haltane", "pdm-haltane.jpg", ["marly", "haltane"]),
    ("Parfums de Marly Valaya", "pdm-valaya.jpg", ["marly", "valaya"]),
    
    # Chanel
    ("Chanel Bleu de Chanel", "chanel-bleu.jpg", ["chanel", "bleu"]),
    ("Chanel No 5", "chanel-no5.jpg", ["chanel", "no 5"]),
    ("Chanel Coco Mademoiselle", "chanel-coco-mademoiselle.jpg", ["chanel", "coco mademoiselle"]),
    ("Chanel Chance", "chanel-chance.jpg", ["chanel", "chance"]),
    ("Chanel Allure Homme Sport", "chanel-allure-homme-sport.jpg", ["chanel", "allure homme sport"]),
    
    # YSL
    ("Yves Saint Laurent Libre", "ysl-libre.jpg", ["libre"]),
    ("Yves Saint Laurent Black Opium", "ysl-black-opium.jpg", ["black opium"]),
    ("Yves Saint Laurent Y", "ysl-y.jpg", ["yves saint", "y "]),
    ("Yves Saint Laurent La Nuit de L'Homme", "ysl-la-nuit.jpg", ["la nuit de l homme"])
]

def search_perfume_image(query):
    # Try Yandex images search
    url = 'https://yandex.com/images/search?text=' + urllib.parse.quote(query + ' флакон парфюм духи')
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=8) as r:
            raw = r.read().decode('utf-8', errors='ignore')
        
        # Look for orig mpic or huge yabs
        urls = re.findall(r'\"(https://avatars\.mds\.yandex\.net/get-mpic/[^\"]+?/orig)\"', raw)
        if not urls:
            urls = re.findall(r'\"(https://avatars\.mds\.yandex\.net/get-yabs_performance/[^\"]+?/huge)\"', raw)
        if not urls:
            urls = re.findall(r'\"(https://avatars\.mds\.yandex\.net/[^\"]+?)\"', raw)
            urls = [u for u in urls if 'images-thumbs' not in u and ('/orig' in u or '/huge' in u or 'get-mpic' in u)]
        
        if urls:
            return urls[0]
            
        # fallback
        any_avatar = re.findall(r'(https://avatars\.mds\.yandex\.net/get-mpic/[^\s\"\'<>]+)', raw)
        if any_avatar:
            return any_avatar[0].split('&')[0]
    except Exception as e:
        print(f"Search err for {query}: {e}")
    return None

def download_and_optimize(img_url, dest_path):
    temp_path = dest_path + '.tmp'
    req = urllib.request.Request(img_url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=12) as r:
            with open(temp_path, 'wb') as f:
                f.write(r.read())
        
        # Optimize using sips: max 800px, quality 85, jpeg
        cmd = [
            'sips',
            '-Z', '800',
            '-s', 'format', 'jpeg',
            '-s', 'formatOptions', '85',
            temp_path,
            '--out', dest_path
        ]
        res = subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        if os.path.exists(temp_path):
            os.remove(temp_path)
        return res.returncode == 0
    except Exception as e:
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except:
                pass
        print(f"Download/optimize error: {e}")
        return False

def main():
    success = 0
    skipped = 0
    failed = 0
    
    print(f"Starting download of {len(PERFUMES)} popular perfume images...")
    for idx, (name, filename, match_keys) in enumerate(PERFUMES):
        dest = os.path.join(OUT_DIR, filename)
        if os.path.exists(dest) and os.path.getsize(dest) > 5000:
            print(f"[{idx+1}/{len(PERFUMES)}] SKIP (already exists): {filename}")
            skipped += 1
            continue
            
        print(f"[{idx+1}/{len(PERFUMES)}] SEARCHING: {name}...")
        img_url = search_perfume_image(name)
        if not img_url:
            # retry without extra words
            time.sleep(0.5)
            img_url = search_perfume_image(name.replace('Christian ', ''))
            
        if img_url:
            ok = download_and_optimize(img_url, dest)
            if ok and os.path.exists(dest) and os.path.getsize(dest) > 1000:
                print(f"   --> OK: {filename} ({os.path.getsize(dest)} bytes)")
                success += 1
            else:
                print(f"   --> FAIL to download/optimize {img_url}")
                failed += 1
        else:
            print(f"   --> NOT FOUND: {name}")
            failed += 1
            
        time.sleep(0.3)
        
    print(f"\nFinished! Success: {success}, Skipped: {skipped}, Failed: {failed}")

if __name__ == '__main__':
    main()
