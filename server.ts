import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/jobs", async (req, res) => {
    try {
      const apiKey = process.env.RAPIDAPI_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "RAPIDAPI_KEY environment variable is required" });
      }

      const query = "graphic designer OR UI designer OR brand designer OR senior designer OR studio manager OR creative director OR video editor OR web developer OR software developer OR app developer OR UX UI OR react developer OR motion designer OR webflow developer in Australia";
      const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&date_posted=week`;
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "x-rapidapi-key": apiKey,
          "x-rapidapi-host": "jsearch.p.rapidapi.com"
        }
      });

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      const data = await response.json();
      
      // Map to our Job format
      const jobs = data.data.map((job: any) => ({
        id: job.job_id,
        title: job.job_title,
        company: job.employer_name,
        location: `${job.job_city || ''} ${job.job_state || ''} ${job.job_country || ''}`.trim() || 'Australia',
        type: job.job_employment_type ? job.job_employment_type.replace('_', ' ') : 'Full-time',
        salary: job.job_min_salary && job.job_max_salary 
          ? `$${job.job_min_salary}k - $${job.job_max_salary}k`
          : 'Salary Negotiable',
        tags: [job.job_employment_type, job.job_is_remote ? 'Remote' : 'On-site'].filter(Boolean),
        postedAt: new Date(job.job_posted_at_datetime_utc).toLocaleDateString(),
        exclusive: false,
        description: job.job_description || 'No description provided.'
      }));

      res.json({ jobs });
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ error: "Failed to fetch jobs" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Note: Express v4 uses '*'
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
