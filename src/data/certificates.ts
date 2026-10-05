export interface CertificateItem {
  id: number;
  title: string;
  organization: string;
  date: string;
  link: string;
}

export const certificates: CertificateItem[] = [
  {
    id: 0,
    title: "Manager Sumber Daya Manusia",
    organization: "BNSP",
    date: "Jul 2026",
    link: "/certificates/bnsp-mgr-hr.pdf",
  },
  {
    id: 1,
    title: "Supervisor Sumber Daya Manusia",
    organization: "BNSP",
    date: "Feb 2026",
    link: "/certificates/bnsp-spv-hr.pdf",
  },
  {
    id: 2,
    title: "AI Enable Python Bootcamp",
    organization: "Devscale",
    date: "Okt 2025",
    link: "/certificates/python.pdf",
  },
  {
    id: 3,
    title: "Junior Web Developer",
    organization: "Komdigi",
    date: "Aug 2025",
    link: "/certificates/junior-web.pdf",
  },
  {
    id: 4,
    title: "React Fundamentals",
    organization: "Dicoding",
    date: "Mar 2025",
    link: "/certificates/react-fundamental.pdf",
  },
  {
    id: 5,
    title: "React Intermediate",
    organization: "ID Camp",
    date: "Mar 2025",
    link: "/certificates/react-intermediate.jpg",
  },
  {
    id: 6,
    title: "Responsive Web Design",
    organization: "FreeCodeCamp",
    date: "Sep 2024",
    link: "/certificates/responsive-web-design.jpg",
  },
  {
    id: 7,
    title: "JavaScript Algorithms and Data Structures",
    organization: "FreeCodeCamp",
    date: "Mar 2024",
    link: "/certificates/js-algorithms.jpg",
  },
  {
    id: 8,
    title: "Full Stack MERN Bootcamp",
    organization: "Devscale",
    date: "Mar 2024",
    link: "/certificates/mern.pdf",
  },
  {
    id: 9,
    title: "React Basic",
    organization: "Hacker Rank",
    date: "Feb 2024",
    link: "/certificates/react-basic.jpg",
  },
  {
    id: 10,
    title: "Data Analytics",
    organization: "Kominfo",
    date: "Aug 2023",
    link: "/certificates/data-analytics.pdf",
  },
  {
    id: 11,
    title: "Data Analytics",
    organization: "Coursera - Google",
    date: "Aug 2023",
    link: "/certificates/data-analytics-coursera.pdf",
  },
  {
    id: 12,
    title: "Information Security Management Systems - ISO 27001:2022",
    organization: "Vidya Consultans",
    date: "Feb 2023",
    link: "/certificates/iso-27001-2022.pdf",
  },
  {
    id: 13,
    title: "Information Security Management Systems - ISO 27001:2013",
    organization: "Buerau Veritas",
    date: "Nov 2022",
    link: "/certificates/iso-27001-2013.pdf",
  },
];
