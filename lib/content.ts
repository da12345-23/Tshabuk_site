export type Locale = "ar" | "en";

export const EVENT = {
  nameAr: "تشابك",
  nameEn: "TASHABUK",
  datesAr: "٨ - ٩ أكتوبر ٢٠٢٦",
  datesEn: "October 8–9, 2026",
  // Location is TBD — update once confirmed.
  locationAr: "سيتم الإعلان عن الموقع قريبًا",
  locationEn: "Location to be announced",
};

export const dictionaries = {
  ar: {
    dir: "rtl" as const,
    appName: EVENT.nameAr,
    tagline: "حملة توعوية بالاضطرابات العصبية العضلية عند الأطفال",
    description:
      "تشابك حملة توعوية تهدف إلى التعريف بالاضطرابات العصبية العضلية عند الأطفال، ودعم العائلات من خلال المعرفة والتواصل والدعم المجتمعي.",
    eventDates: EVENT.datesAr,
    eventLocation: EVENT.locationAr,
    landing: {
      title: "لأن التواصل هو المفتاح",
      subtitle: "أنت مدعو إلى تشابك — اكتب اسمك وابدأ بحل الأحجية لتحصل على دعوتك الخاصة",
      nameLabel: "اسمك",
      namePlaceholder: "اكتب اسمك الثنائي هنا",
      startButton: "ابدأ الأحجية",
      nameRequired: "يرجى كتابة اسمك أولًا",
      leaderboardLink: "لوحة المتصدرين",
    },
    puzzle: {
      title: "رتّب القطع لتكتشف دعوتك",
      instructions: "اسحب كل قطعة إلى مكانها الصحيح لإكمال شعار تشابك",
      timer: "الوقت",
      moves: "عدد المحاولات",
      reset: "إعادة",
      solvedTitle: "أحسنت!",
      solving: "جارٍ الحل...",
    },
    invite: {
      greeting: "أنت مدعو/ة يا",
      body: "يسعدنا دعوتك للانضمام إلينا في فعالية تشابك للتعريف بالاضطرابات العصبية العضلية عند الأطفال",
      dateLabel: "التاريخ",
      locationLabel: "المكان",
      viewLeaderboard: "لوحة المتصدرين",
      playAgain: "العب مرة أخرى",
      yourTime: "وقتك",
    },
    leaderboard: {
      title: "لوحة المتصدرين",
      subtitle: "أسرع من حل الأحجية وحصل على دعوته",
      rank: "الترتيب",
      name: "الاسم",
      time: "الوقت",
      empty: "لا يوجد لاعبون بعد — كن أول من يحل الأحجية!",
      loading: "جارٍ التحميل...",
      back: "العودة",
    },
    langToggle: "English",
  },
  en: {
    dir: "ltr" as const,
    appName: EVENT.nameEn,
    tagline: "Awareness campaign for neuromuscular disorders in children",
    description:
      "Tashabuk is an awareness campaign shedding light on neuromuscular disorders in children — connecting families through knowledge, support, and community.",
    eventDates: EVENT.datesEn,
    eventLocation: EVENT.locationEn,
    landing: {
      title: "Because connection is everything.",
      subtitle: "You're invited to Tashabuk — enter your name and solve the puzzle to reveal your invite",
      nameLabel: "Your name",
      namePlaceholder: "Write your first and last name here",
      startButton: "Start the puzzle",
      nameRequired: "Please enter your name first",
      leaderboardLink: "Leaderboard",
    },
    puzzle: {
      title: "Piece it together to reveal your invite",
      instructions: "Drag each piece into place to complete the Tashabuk logo",
      timer: "Time",
      moves: "Moves",
      reset: "Reset",
      solvedTitle: "Well done!",
      solving: "Solving...",
    },
    invite: {
      greeting: "You're invited,",
      body: "We'd love for you to join us at Tashabuk, an awareness event for neuromuscular disorders in children.",
      dateLabel: "Date",
      locationLabel: "Location",
      viewLeaderboard: "Leaderboard",
      playAgain: "Play again",
      yourTime: "Your time",
    },
    leaderboard: {
      title: "Leaderboard",
      subtitle: "Fastest solvers get their invite first",
      rank: "Rank",
      name: "Name",
      time: "Time",
      empty: "No players yet — be the first to solve it!",
      loading: "Loading...",
      back: "Back",
    },
    langToggle: "العربية",
  },
} satisfies Record<Locale, unknown>;

export type Dictionary = (typeof dictionaries)[Locale];
