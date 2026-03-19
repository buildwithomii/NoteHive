export const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

export const SUBJECTS_BY_SEMESTER: Record<number, string[]> = {
  1: [
    "Engineering Mathematics I",
    "Engineering Physics",
    "Engineering Chemistry",
    "Basic Electrical Engineering",
    "Programming in C",
    "Engineering Graphics",
    "English Communication",
  ],
  2: [
    "Engineering Mathematics II",
    "Engineering Physics Lab",
    "Engineering Chemistry Lab",
    "Data Structures",
    "Digital Electronics",
    "Environmental Science",
    "Workshop Practice",
  ],
  3: [
    "Engineering Mathematics III",
    "Object Oriented Programming",
    "Database Management Systems",
    "Computer Organization",
    "Discrete Mathematics",
    "Data Communication",
  ],
  4: [
    "Engineering Mathematics IV",
    "Operating Systems",
    "Design & Analysis of Algorithms",
    "Software Engineering",
    "Computer Networks",
    "Microprocessors",
  ],
  5: [
    "Theory of Computation",
    "Compiler Design",
    "Computer Graphics",
    "Artificial Intelligence",
    "Web Technologies",
    "Elective I",
  ],
  6: [
    "Machine Learning",
    "Cryptography & Network Security",
    "Cloud Computing",
    "Mobile Application Development",
    "Elective II",
    "Minor Project",
  ],
  7: [
    "Deep Learning",
    "Big Data Analytics",
    "Internet of Things",
    "Elective III",
    "Elective IV",
    "Major Project Phase I",
  ],
  8: [
    "Blockchain Technology",
    "Elective V",
    "Major Project Phase II",
    "Industrial Training",
    "Seminar",
  ],
};

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "highest-rated", label: "Highest Rated" },
  { value: "most-downloaded", label: "Most Downloaded" },
] as const;
