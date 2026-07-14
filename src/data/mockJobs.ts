import { Job } from '../types';

export const MOCK_JOBS: Job[] = [
  {
    id: "1",
    title: "Senior Brand Designer",
    company: "Studio Nectar",
    location: "Melbourne, VIC (Hybrid)",
    type: "Full-time",
    salary: "$110k - $130k",
    tags: ["Branding", "Typography", "Print"],
    postedAt: "2 days ago",
    exclusive: true,
    description: "We are looking for a Senior Brand Designer to lead identity projects for boutique hospitality and lifestyle brands. You will be responsible for conceptualizing and executing high-end visual identities."
  },
  {
    id: "2",
    title: "UX/UI Designer",
    company: "FinTech Aus",
    location: "Sydney, NSW",
    type: "Full-time",
    salary: "$120k - $140k",
    tags: ["Figma", "Prototyping", "Fintech"],
    postedAt: "5 hours ago",
    description: "Join our core product team to design intuitive financial dashboards. You will work closely with product managers and engineers to simplify complex data visualization."
  },
  {
    id: "3",
    title: "Digital Art Director",
    company: "Creative Collective",
    location: "Brisbane, QLD",
    type: "Contract",
    salary: "$600/day",
    tags: ["Campaigns", "Web Design", "Direction"],
    postedAt: "1 week ago",
    description: "Seeking an Art Director for a 3-month contract focusing on a national tourism campaign. Must have a strong portfolio demonstrating digital-first campaign thinking."
  },
  {
    id: "4",
    title: "Webflow Developer & Designer",
    company: "Digital Artisan",
    location: "Remote, AUS",
    type: "Freelance",
    salary: "$80 - $120/hr",
    tags: ["Webflow", "UI Design", "Animation"],
    postedAt: "3 days ago",
    exclusive: true,
    description: "Looking for a Webflow expert to build highly interactive marketing sites. Strong understanding of interactions and custom CSS is required."
  },
  {
    id: "5",
    title: "Illustrator",
    company: "Storybook Publishing",
    location: "Hobart, TAS",
    type: "Part-time",
    salary: "$60k - $75k (Pro-rata)",
    tags: ["Illustration", "Editorial", "Drawing"],
    postedAt: "Just now",
    description: "Create beautiful, whimsical illustrations for our upcoming children's book series. A unique, hand-drawn style is preferred."
  },
  {
    id: "6",
    title: "Motion Graphics Designer",
    company: "Pixel Perfect",
    location: "Adelaide, SA",
    type: "Full-time",
    salary: "$90k - $110k",
    tags: ["After Effects", "Cinema 4D", "Animation"],
    postedAt: "4 days ago",
    description: "Bring brands to life through motion. You will be creating social media assets, explainer videos, and UI animations."
  }
];
