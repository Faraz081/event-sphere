export const dashboardStats = [
  { label: "Active Expos", value: 12, icon: "expos" },
  { label: "Total Exhibitors", value: 348, icon: "exhibitors" },
  { label: "Registered Attendees", value: "4,215", icon: "attendees" },
  { label: "Booths Reserved", value: "89%", icon: "booths" },
]

export const boothTrafficData = [
  { day: "Mon", visitors: 120 },
  { day: "Tue", visitors: 190 },
  { day: "Wed", visitors: 150 },
  { day: "Thu", visitors: 210 },
  { day: "Fri", visitors: 180 },
  { day: "Sat", visitors: 260 },
  { day: "Sun", visitors: 230 },
];

export const mockExpos = [
  {
    id: 1,
    title: "Tech Innovate Expo 2026",
    date: "2026-09-15",
    location: "Karachi Expo Centre",
    status: "upcoming",
  },
  {
    id: 2,
    title: "Global Trade Summit",
    date: "2026-08-20",
    location: "Dubai World Trade Centre",
    status: "ongoing",
  },
  {
    id: 3,
    title: "Future of Manufacturing",
    date: "2026-05-10",
    location: "Lahore Expo Centre",
    status: "completed",
  },
  {
    id: 4,
    title: "Health & Wellness Fair",
    date: "2026-10-02",
    location: "Karachi Expo Centre",
    status: "upcoming",
  },
];

export const mockBooths = [
  {
    id: 1,
    boothNumber: "A-101",
    expoTitle: "Tech Innovate Expo 2026",
    exhibitor: "Nova Robotics",
    status: "occupied",
  },
  {
    id: 2,
    boothNumber: "A-102",
    expoTitle: "Tech Innovate Expo 2026",
    exhibitor: null,
    status: "available",
  },
  {
    id: 3,
    boothNumber: "B-201",
    expoTitle: "Global Trade Summit",
    exhibitor: "Zenith Textiles",
    status: "reserved",
  },
  {
    id: 4,
    boothNumber: "B-202",
    expoTitle: "Global Trade Summit",
    exhibitor: null,
    status: "available",
  },
];

export const mockSchedule = [
  {
    id: 1,
    sessionTitle: "Opening Keynote: The Future of Expos",
    speaker: "Ayesha Raza",
    date: "2026-09-15",
    startTime: "09:00",
    endTime: "10:00",
    location: "Main Hall",
  },
  {
    id: 2,
    sessionTitle: "AI in Trade Shows: A Panel Discussion",
    speaker: "Bilal Khan",
    date: "2026-09-15",
    startTime: "10:30",
    endTime: "11:30",
    location: "Conference Room A",
  },
  {
    id: 3,
    sessionTitle: "Sustainable Exhibition Design",
    speaker: "Sara Malik",
    date: "2026-09-15",
    startTime: "13:00",
    endTime: "14:00",
    location: "Conference Room B",
  },
];

export const mockExhibitors = [
  {
    id: 1,
    companyName: "Nova Robotics",
    contactName: "Imran Sheikh",
    email: "imran@novarobotics.com",
    expoTitle: "Tech Innovate Expo 2026",
    productsServices: "Industrial automation robots",
    status: "approved",
    boothNumber: "A-101",
  },
  {
    id: 2,
    companyName: "Zenith Textiles",
    contactName: "Hina Aslam",
    email: "hina@zenithtextiles.com",
    expoTitle: "Global Trade Summit",
    productsServices: "Export-grade fabrics and garments",
    status: "approved",
    boothNumber: "B-201",
  },
  {
    id: 3,
    companyName: "Greenline Foods",
    contactName: "Usman Tariq",
    email: "usman@greenlinefoods.com",
    expoTitle: "Tech Innovate Expo 2026",
    productsServices: "Organic packaged foods",
    status: "pending",
    boothNumber: null,
  },
  {
    id: 4,
    companyName: "Skyline Furnishings",
    contactName: "Ayesha Noor",
    email: "ayesha@skylinefurnishings.com",
    expoTitle: "Global Trade Summit",
    productsServices: "Modular office furniture",
    status: "pending",
    boothNumber: null,
  },
  {
    id: 5,
    companyName: "Bright Future Toys",
    contactName: "Kamran Ali",
    email: "kamran@brightfuturetoys.com",
    expoTitle: "Health & Wellness Fair",
    productsServices: "Educational toys",
    status: "rejected",
    boothNumber: null,
  },
];

export const mockEvents = [
  {
    id: 1,
    title: "Tech Innovation Expo 2026",
    category: "expo",
    date: "2026-09-15",
    location: "Karachi Expo Center",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
    status: "upcoming",
    description: "Explore cutting-edge technology from 200+ exhibitors across AI, robotics, and fintech.",
    featured: true,
  },
  {
    id: 2,
    title: "Global Trade Summit",
    category: "conference",
    date: "2026-08-20",
    location: "Pearl Continental, Lahore",
    image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80",
    status: "ongoing",
    description: "Industry leaders discuss the future of international trade and supply chains.",
    featured: true,
  },
  {
    id: 3,
    title: "Sunset Beats Music Festival",
    category: "concert",
    date: "2026-10-05",
    location: "DHA Beach, Karachi",
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80",
    status: "upcoming",
    description: "A night of live performances from top regional artists under the stars.",
    featured: true,
  },
  {
    id: 4,
    title: "Startup Founders Workshop",
    category: "workshop",
    date: "2026-07-28",
    location: "NIC Karachi",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80",
    status: "past",
    description: "Hands-on session covering fundraising, pitch decks, and early-stage growth.",
    featured: false,
  },
  {
    id: 5,
    title: "HealthTech Expo",
    category: "expo",
    date: "2026-11-12",
    location: "Expo Centre Lahore",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
    status: "upcoming",
    description: "Showcasing the latest in medical devices, telehealth, and digital diagnostics.",
    featured: false,
  },
  {
    id: 6,
    title: "Design & Branding Conference",
    category: "conference",
    date: "2026-08-30",
    location: "Mövenpick Hotel, Karachi",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80",
    status: "upcoming",
    description: "Creative leaders share insights on brand strategy and visual identity.",
    featured: false,
  },
];

export const mockGallery = [
  { id: 1, image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80", caption: "Tech Innovation Expo — Main Hall", size: "large" },
  { id: 2, image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600&q=80", caption: "Networking Session", size: "small" },
  { id: 3, image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&q=80", caption: "Keynote Speaker Address", size: "medium" },
  { id: 4, image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&q=80", caption: "Global Trade Summit Panel", size: "small" },
  { id: 5, image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80", caption: "Exhibitor Booth Setup", size: "medium" },
  { id: 6, image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&q=80", caption: "Sunset Beats Music Festival", size: "medium" },
  { id: 7, image: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&q=80", caption: "Live Performance Crowd", size: "medium" },
  { id: 8, image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&q=80", caption: "Startup Workshop Session", size: "medium" },
  { id: 9, image: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=600&q=80", caption: "Award Ceremony Moment", size: "medium" },
  { id: 10, image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80", caption: "Conference Attendees Networking", size: "large" },
  { id: 11, image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600&q=80", caption: "International Business Conference", size: "small" },
  { id: 12, image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&q=80", caption: "Outdoor Exhibition Event", size: "large" },
  
];

export const mockTestimonials = [
  {
    id: 1,
    name: "Ahmed Raza",
    role: "Exhibitor, Tech Innovation Expo",
    quote: "EventSphere made booth booking effortless. We tracked visitor traffic in real time and it completely changed how we planned our next expo.",
  },
  {
    id: 2,
    name: "Sana Malik",
    role: "Attendee, Global Trade Summit",
    quote: "I loved how easy it was to browse exhibitors and bookmark sessions ahead of time. No more printed schedules or confusion at the venue.",
  },
  {
    id: 3,
    name: "Bilal Sheikh",
    role: "Organizer, HealthTech Expo",
    quote: "Managing hundreds of exhibitor applications used to take weeks. With EventSphere's dashboard, we approved and assigned booths in a single afternoon.",
  },
];

export const mockFAQs = [
  {
    id: 1,
    question: "How do I register as an exhibitor?",
    answer: "Simply sign up on the Register page, select 'Exhibitor' as your role, and submit your company details. Once approved by the event organizer, you'll be able to select and reserve your booth.",
  },
  {
    id: 2,
    question: "Can I attend multiple events with one account?",
    answer: "Yes. Your EventSphere account works across all events on the platform — you can browse, register, and bookmark sessions for any expo, conference, or concert.",
  },
  {
    id: 3,
    question: "How does booth selection work for exhibitors?",
    answer: "After your application is approved, you'll get access to an interactive floor plan showing available booths. You can select and reserve a space based on your preferences and budget.",
  },
  {
    id: 4,
    question: "Is there a fee to create an organizer account?",
    answer: "No, creating an account is completely free. Organizers only manage their own events — pricing for exhibitor booths or attendee tickets is set individually per event.",
  },
];