import math
import csv

PARTICIPANTS = 20

MAX_BOP = 10 #kg

TOTAL_RACES = 12
MAX_POINTS_PER_RACE = 27  #16 #15-12-10-8-6-5-4-3-2-1   +1 pole

SZEZON = {
    1:  "Bahrain",
    2:  "Saudi Arabia",
    3:  "Australia",
    4:  "Azerbaijan",
    5:  "Miami",
    6:  "USA",
    7:  "Spain",
    8:  "Canada",
    9:  "Austria",
    10: "Britain",
    11: "Hungary",
    12: "Belgium",
}

LENGTH, TYPE, LAPTIME, OT, FUEL = 0, 1, 2, 3, 4
TRACKS = { # key: name | value: [length, type, laptime, ot, fuel]
#     Name          Length  Type      Laptime  OT   Fuel
    "Bahrain":      [5412, "stop_go", 87.293, 0.75, 1.10],
    "Saudi Arabia": [6174, "fast",    85.541, 0.65, 0.95],
    "Australia":    [5278, "mixed",   75.980, 0.70, 1.00],
    "Azerbaijan":   [6003, "street",  98.513, 0.80, 1.05],
    "Miami":        [5412, "mixed",   85.608, 0.65, 1.00],
    "Monaco":       [3337, "street",  68.238, 0.05, 1.15],
    "Spain":        [4657, "mixed",   70.346, 0.55, 1.05],
    "Canada":       [4361, "stop_go", 68.371, 0.85, 1.10],
    "Austria":      [4318, "stop_go", 62.668, 0.90, 1.10],
    "Britain":      [5891, "fast",    84.336, 0.65, 0.95],
    "Hungary":      [4381, "street",  74.600, 0.30, 1.15],
    "Belgium":      [7004, "fast",   100.231, 0.80, 0.95],
    "Netherlands":  [4259, "mixed",   67.490, 0.40, 1.05],
    "Italy":        [5793, "fast",    77.950, 0.85, 0.90],
    "Singapore":    [4928, "street",  87.207, 0.20, 1.20],
    "Japan":        [5807, "fast",    85.687, 0.50, 1.00],
    "Qatar":        [5419, "fast",    79.684, 0.60, 1.00],
    "USA":          [5513, "mixed",   90.880, 0.75, 1.00],
    "Mexico":       [4304, "mixed",   74.927, 0.70, 0.95],
    "Brazil":       [4309, "mixed",   66.886, 0.85, 1.05],
    "Las Vegas":    [6201, "fast",    89.996, 0.90, 0.90],
    "Abu Dhabi":    [5281, "mixed",   81.235, 0.60, 1.00],
    "China":        [5451, "mixed",   89.875, 0.75, 1.05],
    "France":       [5842, "mixed",   88.259, 0.85, 1.00],
    "Imola":        [4909, "mixed",   73.274, 0.60, 1.05],
    "Portugal":     [0,'mixed',0,0,0],
}
AVG_TRACK_LENGTH = round( sum(TRACKS[track][LENGTH] for track in TRACKS.keys() ) / len(TRACKS) ) # ~ 5210

track_type_map = {
        "stop_go"   : 1.15,
        "street"    : 1.10,
        "mixed"     : 1.00,
        "fast"      : 0.90,
    }



class Driver:
    def __init__(self, name, results, position, points):
        self.name = name
        self.results = results  # list[int]
        self.position = position
        self.points = points

    def top3_count(self):
        invalid = ['', 'DNF', 'DNS', 'DNA', 'DSQ']
        count = 0
        for r in self.results:
            if r in invalid: continue
            try:
                if int(r) <= 3:
                    count += 1
            except: continue
        return count

def get_leader_points(drivers):
    return max([driver.points for driver in drivers])

def load_drivers( file_path = 'C:\\Users\\Dani\\Desktop\\RAJTVONAL\\SimMasters\\database\\SM\\BOP_input.csv' ):
    drivers = []
    rows_done = 0
    with open(file_path, newline='', encoding='utf-8') as csvfile:
        reader = csv.reader(csvfile)
        for row in reader:

            rows_done += 1
            if rows_done > PARTICIPANTS + 5: break

            if len(row) < 15: continue

            name = row[1].strip()
            if not name: continue

            try:
                position = int(row[0].replace('.', '').strip())
            except: continue

            results = row[3:15]

            try:
                points = int(row[15])
            except:
                continue

            drivers.append(Driver(name, results, position, points))

    return drivers

def save_bops(results, file_path = 'C:\\Users\\Dani\\Desktop\\RAJTVONAL\\SimMasters\\database\\SM\\BOP_output.txt'):
    with open(file_path, 'w', encoding='utf-8') as f:
        for name, bop in results:
            f.write(f"{name} - {bop:.2f}\n")

def calculate_all_bops(drivers, current_race):
    leader_points = get_leader_points(drivers)
        
    results = []
    for driver in drivers:
        bop = calculate_bop(
            position=driver.position,
            point=driver.points,
            leader_points=leader_points,
            current_race=current_race,
            top3_results=driver.top3_count()
        )
        results.append((driver.name, bop))

        print(f'DEBUG ###   {driver.position}. ({driver.points} p)  DRIVER: {driver.name} - {bop:.2f}\n\n')

    return results

def calculate_bop(position=1, point=0, leader_points=0, current_race=1, top3_results=0):
    current_track = SZEZON[current_race]

    # VERSENY SPECIFIKUS: SZE, TRA, TYP, C_UP, FUL, OVT
    # DRIVER SPECIFIKUS: DOM, POZ, KON
 
    # --- DOMINANCIA
    races_done = max(1, current_race - 1)
    dominance = point / ( MAX_POINTS_PER_RACE * races_done)
    gap_to_first       = point / leader_points   if leader_points > 0    else 0
    DOM = 0.5 * dominance + 0.5 * gap_to_first

    # --- SZEZON ELŐREHALADÁS
    SZE = current_race / TOTAL_RACES

    # --- POZÍCIÓ
    POZ = 1 - ( ( position - 1 ) / ( PARTICIPANTS - 1 ) )

    # --- PÁLYAHOSSZ
    TRA = TRACKS[current_track][LENGTH] / AVG_TRACK_LENGTH

    # --- KARAKTERISZTIKA
    TYP = track_type_map[TRACKS[current_track][TYPE]]

    # --- PONTKÜLÖNBSÉG
    delta = leader_points - point
    h = 30
    GAP = 1 - math.exp(-delta / h)   if delta > 0    else 1

    # --- CATCH-UP
    C_UP = 1 - math.exp(-3 * SZE)

    # --- KONZISZTENCIA
    KON = 1 + ( 0.1 * top3_results / current_race )

    # --- ÜZEMANYAGHASZNÁLAT
    FUL = TRACKS[current_track][FUEL]

    # --- ELŐZHETŐSÉG
    OVT = 1 + (0.5 - TRACKS[current_track][OT])

    print(f'\t\t\t\tDOM={DOM:.2f} | SZE={SZE:.2f} | POZ={POZ:.2f} | TRA={TRA:.2f} | TYP={TYP:.2f} | GAP={GAP:.2f} | C_UP={C_UP:.2f} | KON={KON:.2f} | FUL={FUL:.2f} | OVT={OVT:.2f}')
    bop = MAX_BOP * \
            DOM   * \
            SZE   * \
            POZ   * \
            TRA   * \
            TYP   * \
            GAP   * \
            C_UP  * \
            KON   * \
            FUL   * \
            OVT
    
    bop = max(0, min(MAX_BOP, bop))
    return bop


if __name__ == '__main__':

    #print(calculate_bop(1, 11, 15, 3, 11))

    drivers = load_drivers('C:\\Users\\Dani\\Desktop\\RAJTVONAL\\SimMasters\\database\\SM\\BOP_input.csv')
    current_race = 12
    
    bops = calculate_all_bops(drivers, current_race)
    save_bops(bops, 'C:\\Users\\Dani\\Desktop\\RAJTVONAL\\SimMasters\\database\\SM\\BOP_output.txt')

