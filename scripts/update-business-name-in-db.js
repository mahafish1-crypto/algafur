const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  console.log('--- Resuming & Completing Database Records Update ---');

  // 1. FAQs
  const faqs = await prisma.fAQ.findMany();
  for (const faq of faqs) {
    if (/AL-GAFUR|Al-Gafur/i.test(faq.question) || /AL-GAFUR|Al-Gafur/i.test(faq.answer)) {
      const newQuestion = faq.question
        .replace(/Al-Gafur International Tours And Travels/gi, 'AL GAFUR INTERNATIONAL TOURS AND TRAVELS')
        .replace(/Al-Gafur/gi, 'AL GAFUR')
        .replace(/AL-GAFUR/g, 'AL GAFUR');
      const newAnswer = faq.answer
        .replace(/Al-Gafur International Tours And Travels/gi, 'AL GAFUR INTERNATIONAL TOURS AND TRAVELS')
        .replace(/Al-Gafur/gi, 'AL GAFUR')
        .replace(/AL-GAFUR/g, 'AL GAFUR');
      await prisma.fAQ.update({
        where: { id: faq.id },
        data: { question: newQuestion, answer: newAnswer },
      });
      console.log(`Updated FAQ id=${faq.id}`);
    }
  }

  // 2. Blog Posts
  const blogPosts = await prisma.blogPost.findMany();
  for (const post of blogPosts) {
    let changed = false;
    let data = {};
    if (post.title && /AL-GAFUR|Al-Gafur/i.test(post.title)) {
      data.title = post.title.replace(/AL-GAFUR/g, 'AL GAFUR').replace(/Al-Gafur/gi, 'AL GAFUR');
      changed = true;
    }
    if (post.content && /AL-GAFUR|Al-Gafur/i.test(post.content)) {
      data.content = post.content
        .replace(/Al-Gafur International Tours And Travels/gi, 'AL GAFUR INTERNATIONAL TOURS AND TRAVELS')
        .replace(/AL-GAFUR/g, 'AL GAFUR')
        .replace(/Al-Gafur/gi, 'AL GAFUR');
      changed = true;
    }
    if (changed) {
      await prisma.blogPost.update({
        where: { id: post.id },
        data,
      });
      console.log(`Updated BlogPost "${post.slug}"`);
    }
  }

  // 3. Testimonials
  const testimonials = await prisma.testimonial.findMany();
  for (const t of testimonials) {
    if (t.reviewText && /AL-GAFUR|Al-Gafur/i.test(t.reviewText)) {
      const newText = t.reviewText
        .replace(/Travelling with Al-Gafur/gi, 'Travelling with AL GAFUR')
        .replace(/Al-Gafur team/gi, 'AL GAFUR team')
        .replace(/AL-GAFUR/g, 'AL GAFUR')
        .replace(/Al-Gafur/gi, 'AL GAFUR');
      await prisma.testimonial.update({
        where: { id: t.id },
        data: { reviewText: newText },
      });
      console.log(`Updated Testimonial id=${t.id}`);
    }
  }

  // 4. Packages
  const packages = await prisma.package.findMany();
  for (const pkg of packages) {
    let changed = false;
    let data = {};
    if (pkg.overview && /AL-GAFUR|Al-Gafur/i.test(pkg.overview)) {
      data.overview = pkg.overview
        .replace(/Al-Gafur International Tours And Travels/gi, 'AL GAFUR INTERNATIONAL TOURS AND TRAVELS')
        .replace(/AL-GAFUR International/gi, 'AL GAFUR INTERNATIONAL TOURS AND TRAVELS')
        .replace(/AL-GAFUR/g, 'AL GAFUR')
        .replace(/Al-Gafur/gi, 'AL GAFUR');
      changed = true;
    }
    if (pkg.seoKeywords && /AL-GAFUR|Al-Gafur/i.test(pkg.seoKeywords)) {
      data.seoKeywords = pkg.seoKeywords
        .replace(/AL-GAFUR/g, 'AL GAFUR')
        .replace(/Al-Gafur/gi, 'AL GAFUR');
      changed = true;
    }
    if (changed) {
      await prisma.package.update({
        where: { id: pkg.id },
        data,
      });
      console.log(`Updated Package "${pkg.name}"`);
    }
  }

  console.log('--- All Database records updated successfully! ---');
}

run()
  .catch((err) => {
    console.error('Error running update script:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
