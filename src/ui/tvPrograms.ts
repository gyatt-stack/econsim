/** Full programs from the regional feed. Local stations produce their own shows in the simulation. */
export interface TvProgram {
  id: string;
  year: number;
  title: string;
  series: string;
  credit: string;
  url: string;
  source: string;
  license?: string;
}

const ccBy = 'https://creativecommons.org/licenses/by/3.0/';

const programs: readonly TvProgram[] = [
  {
    id: 'sea-otters', year: 2, series: 'Ocean Today', title: 'Sea Otters 101', credit: 'NOAA Ocean Today',
    url: 'https://oceantoday.noaa.gov/seaotters101/otkx_118a_seaotters_101_lg.mp4',
    source: 'https://oceantoday.noaa.gov/seaotters101/',
  },
  {
    id: 'manatees', year: 3, series: 'Ocean Today', title: 'Manatees 101', credit: 'NOAA Ocean Today',
    url: 'https://oceantoday.noaa.gov/manatees101/otkx_118b_manatee_101_sm.mp4',
    source: 'https://oceantoday.noaa.gov/manatees101/',
  },
  {
    id: 'llamigos', year: 3, series: 'Caminandes', title: 'Llamigos', credit: 'Blender Institute', license: ccBy,
    url: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Caminandes_3_-_Llamigos_-_Blender_Animated_Short.webm',
    source: 'https://www.youtube.com/watch?v=SkVqJ1SGeL0',
  },
  {
    id: 'big-buck-bunny', year: 4, series: 'Movie Night', title: 'Big Buck Bunny', credit: 'Blender Foundation', license: ccBy,
    url: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/4/41/Big_Buck_Bunny_medium.ogv/Big_Buck_Bunny_medium.ogv.480p.vp9.webm',
    source: 'https://peach.blender.org/',
  },
];

export function programsForYear(year: number): TvProgram[] {
  return programs.filter((program) => program.year <= year);
}
