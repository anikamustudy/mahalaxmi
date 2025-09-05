import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@startup.com' },
    update: {},
    create: {
      email: 'admin@startup.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  // Create tags
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { slug: 'creative' },
      update: {},
      create: { name: 'Creative', slug: 'creative', color: '#10B981' },
    }),
    prisma.tag.upsert({
      where: { slug: 'computer' },
      update: {},
      create: { name: 'Computer', slug: 'computer', color: '#3B82F6' },
    }),
    prisma.tag.upsert({
      where: { slug: 'design' },
      update: {},
      create: { name: 'Design', slug: 'design', color: '#8B5CF6' },
    }),
    prisma.tag.upsert({
      where: { slug: 'technology' },
      update: {},
      create: { name: 'Technology', slug: 'technology', color: '#F59E0B' },
    }),
  ])

  // Create blog posts
  await prisma.blog.upsert({
    where: { slug: 'best-ui-components-for-modern-websites' },
    update: {},
    create: {
      title: 'Best UI components for modern websites',
      content: `# Best UI components for modern websites

Modern web development requires carefully crafted user interface components that provide both functionality and aesthetic appeal. In this comprehensive guide, we'll explore the most essential UI components that every modern website should consider implementing.

## Essential Components

### Navigation Components
- **Header Navigation**: Clean, responsive navigation bars
- **Sidebar Navigation**: Perfect for dashboards and admin panels
- **Breadcrumbs**: Help users understand their location within your site

### Form Elements
- **Input Fields**: Well-designed text inputs with proper validation
- **Buttons**: Call-to-action buttons with hover states and loading indicators
- **Dropdowns**: Custom select components that work across all devices

### Data Display
- **Cards**: Flexible containers for content organization
- **Tables**: Responsive data tables with sorting and filtering
- **Modals**: Overlay components for focused interactions

## Best Practices

When implementing UI components, always consider:
1. **Accessibility**: Ensure components work with screen readers
2. **Responsiveness**: Test on various screen sizes
3. **Performance**: Optimize for fast loading times
4. **Consistency**: Maintain design system standards

Modern UI components should be built with user experience as the top priority, ensuring they're intuitive, accessible, and performant across all devices.`,
      excerpt: 'Discover the essential UI components that make modern websites stand out with clean design and exceptional user experience.',
      image: '/images/blog/blog-01.jpg',
      slug: 'best-ui-components-for-modern-websites',
      published: true,
      featured: true,
      authorId: admin.id,
      tags: {
        connect: [{ slug: 'creative' }, { slug: 'design' }],
      },
    },
  })

  await prisma.blog.upsert({
    where: { slug: '9-simple-ways-to-improve-design-skills' },
    update: {},
    create: {
      title: '9 simple ways to improve your design skills',
      content: `# 9 Simple Ways to Improve Your Design Skills

Design skills are crucial in today's digital landscape. Whether you're a developer, marketer, or entrepreneur, having good design sensibilities can set you apart from the competition.

## 1. Study Great Design

Look at award-winning websites, apps, and print materials. Analyze what makes them effective:
- **Color schemes**: How do they use color to guide attention?
- **Typography**: What fonts create the right mood?
- **Layout**: How is white space utilized?

## 2. Practice Daily

Set aside time each day for design practice:
- Recreate designs you admire
- Take on small personal projects
- Experiment with new tools and techniques

## 3. Learn Design Principles

Master the fundamentals:
- **Hierarchy**: Guide users through your content
- **Contrast**: Make important elements stand out
- **Balance**: Create visual stability
- **Proximity**: Group related elements together

## 4. Get Feedback

Share your work with others and ask for honest criticism. Join design communities where you can get constructive feedback from experienced designers.

## 5. Use Design Tools

Become proficient with industry-standard tools:
- **Figma**: For UI/UX design and prototyping
- **Adobe Creative Suite**: For comprehensive design work
- **Sketch**: Popular among UI designers

## 6. Follow Design Trends

Stay updated with current design trends, but don't follow them blindly. Understand why certain trends emerge and when to apply them.

## 7. Study Typography

Typography can make or break a design. Learn about:
- Font pairing
- Hierarchy through font sizes
- Readability and legibility
- When to use serif vs. sans-serif

## 8. Understand Color Theory

Colors evoke emotions and can significantly impact user behavior. Study:
- Color psychology
- Complementary color schemes
- Accessibility considerations

## 9. Practice Restraint

Sometimes less is more. Learn when to remove elements rather than add them. Good design often involves knowing what to leave out.

Remember, becoming a skilled designer takes time and practice. Be patient with yourself and enjoy the learning process!`,
      excerpt: 'Learn practical techniques to enhance your design abilities and create more visually appealing and effective designs.',
      image: '/images/blog/blog-02.jpg',
      slug: '9-simple-ways-to-improve-design-skills',
      published: true,
      authorId: admin.id,
      tags: {
        connect: [{ slug: 'creative' }, { slug: 'design' }],
      },
    },
  })

  await prisma.blog.upsert({
    where: { slug: 'tips-to-improve-coding-speed' },
    update: {},
    create: {
      title: 'Tips to quickly improve your coding speed',
      content: `# Tips to Quickly Improve Your Coding Speed

Coding speed is crucial for productivity, but it shouldn't come at the expense of code quality. Here are proven strategies to help you code faster while maintaining high standards.

## Master Your Tools

### IDE and Text Editor Optimization
- Learn keyboard shortcuts for your editor
- Customize your IDE for maximum efficiency
- Use code snippets and templates
- Set up auto-completion and IntelliSense

### Version Control Proficiency
- Master Git commands for faster workflow
- Use branching strategies effectively
- Automate repetitive Git tasks

## Typing and Navigation Skills

### Improve Typing Speed
- Practice touch typing regularly
- Aim for at least 60 WPM
- Learn to type special characters without looking

### Efficient Code Navigation
- Use Ctrl+Click to jump to definitions
- Master search and replace operations
- Learn to navigate between files quickly

## Code Organization and Patterns

### Follow Consistent Patterns
- Establish coding conventions
- Use design patterns appropriately
- Create reusable code components
- Build a personal library of utility functions

### Plan Before Coding
- Break down complex problems into smaller parts
- Write pseudocode first
- Use flowcharts for complex logic

## Development Environment

### Optimize Your Workspace
- Use multiple monitors if possible
- Keep frequently used tools easily accessible
- Organize your file structure logically
- Use package managers and build tools

### Automation
- Write scripts for repetitive tasks
- Use task runners and build systems
- Implement continuous integration
- Automate testing and deployment

## Learning and Practice

### Stay Updated
- Learn new language features and APIs
- Follow best practices and coding standards
- Read documentation regularly
- Stay current with development trends

### Practice Regularly
- Solve coding challenges
- Contribute to open source projects
- Build side projects
- Pair program with other developers

## Time Management

### Focus Techniques
- Use the Pomodoro technique
- Eliminate distractions
- Set specific coding goals
- Take regular breaks

### Prioritize Tasks
- Work on the most important features first
- Avoid premature optimization
- Know when to refactor and when to move on

Remember, speed comes with experience. Focus on writing clean, maintainable code first, and speed will naturally follow as you become more proficient.`,
      excerpt: 'Discover practical strategies to increase your coding productivity without sacrificing code quality and maintainability.',
      image: '/images/blog/blog-03.jpg',
      slug: 'tips-to-improve-coding-speed',
      published: true,
      authorId: admin.id,
      tags: {
        connect: [{ slug: 'computer' }, { slug: 'technology' }],
      },
    },
  })

  // Create features
  const features = [
    {
      title: 'Clean Code',
      description: 'Write clean, maintainable code with best practices and modern development standards.',
      icon: 'Code2',
      order: 1,
    },
    {
      title: 'Mobile First',
      description: 'Responsive design approach that works perfectly on all devices and screen sizes.',
      icon: 'Smartphone',
      order: 2,
    },
    {
      title: 'Fast Performance',
      description: 'Optimized for speed with modern web technologies and efficient code architecture.',
      icon: 'Zap',
      order: 3,
    },
    {
      title: 'SEO Optimized',
      description: 'Built with SEO best practices to help your website rank higher in search results.',
      icon: 'Search',
      order: 4,
    },
    {
      title: 'Secure',
      description: 'Enterprise-grade security features to protect your application and user data.',
      icon: 'Shield',
      order: 5,
    },
    {
      title: '24/7 Support',
      description: 'Round-the-clock technical support to help you whenever you need assistance.',
      icon: 'Headphones',
      order: 6,
    },
  ]

  for (const feature of features) {
    await prisma.feature.upsert({
      where: { title: feature.title },
      update: {},
      create: feature,
    })
  }

  // Create testimonials
  const testimonials = [
    {
      name: 'Sarah Johnson',
      designation: 'CEO',
      company: 'TechCorp Inc.',
      image: '/images/testimonials/auth-01.png',
      content: 'This startup template has transformed how we approach web development. The clean code and modern architecture made our project launch 3x faster.',
      rating: 5,
      featured: true,
      order: 1,
    },
    {
      name: 'Michael Chen',
      designation: 'Lead Developer',
      company: 'InnovateLab',
      image: '/images/testimonials/auth-02.png',
      content: 'Outstanding template with excellent documentation. The API structure and database design are exactly what we needed for our enterprise application.',
      rating: 5,
      featured: true,
      order: 2,
    },
    {
      name: 'Emily Rodriguez',
      designation: 'Product Manager',
      company: 'StartupHub',
      image: '/images/testimonials/auth-03.png',
      content: 'The admin dashboard and user management features saved us months of development time. Highly recommended for any serious project.',
      rating: 5,
      order: 3,
    },
  ]

  for (const testimonial of testimonials) {
    await prisma.testimonial.upsert({
      where: { name: testimonial.name },
      update: {},
      create: testimonial,
    })
  }

  // Create brands
  const brands = [
    { name: 'UIdeck', logo: '/images/brands/uideck.svg', website: 'https://uideck.com', order: 1 },
    { name: 'Tailgrids', logo: '/images/brands/tailgrids.svg', website: 'https://tailgrids.com', order: 2 },
    { name: 'Lineicons', logo: '/images/brands/lineicons.svg', website: 'https://lineicons.com', order: 3 },
    { name: 'Ayro UI', logo: '/images/brands/ayroui.svg', website: 'https://ayroui.com', order: 4 },
  ]

  for (const brand of brands) {
    await prisma.brand.upsert({
      where: { name: brand.name },
      update: {},
      create: brand,
    })
  }

  // Create pricing plans
  const pricingPlans = [
    {
      name: 'Lite',
      price: 19,
      period: 'monthly',
      description: 'Perfect for small projects and startups',
      features: [
        '5 User Accounts',
        '10 GB Storage',
        'Email Support',
        'Basic Analytics',
        'Mobile App Access',
      ],
      popular: false,
      order: 1,
    },
    {
      name: 'Basic',
      price: 49,
      period: 'monthly',
      description: 'Great for growing businesses',
      features: [
        '25 User Accounts',
        '50 GB Storage',
        'Priority Support',
        'Advanced Analytics',
        'Mobile App Access',
        'API Access',
        'Custom Integrations',
      ],
      popular: true,
      order: 2,
    },
    {
      name: 'Plus',
      price: 99,
      period: 'monthly',
      description: 'Best for large organizations',
      features: [
        'Unlimited User Accounts',
        '500 GB Storage',
        '24/7 Phone Support',
        'Advanced Analytics',
        'Mobile App Access',
        'API Access',
        'Custom Integrations',
        'White-label Solution',
        'Dedicated Account Manager',
      ],
      popular: false,
      order: 3,
    },
  ]

  for (const plan of pricingPlans) {
    await prisma.pricingPlan.upsert({
      where: { name: plan.name },
      update: {},
      create: plan,
    })
  }

  // Create site settings
  const siteSettings = [
    {
      key: 'site_name',
      value: 'Startup Pro',
      type: 'string',
      description: 'The name of the website',
    },
    {
      key: 'site_tagline',
      value: 'Free Next.js Template for Startup and SaaS',
      type: 'string',
      description: 'The tagline/subtitle of the website',
    },
    {
      key: 'contact_email',
      value: 'contact@startup.com',
      type: 'string',
      description: 'Primary contact email address',
    },
    {
      key: 'hero_title',
      value: 'Make your startup stand out with our template',
      type: 'string',
      description: 'Main hero section title',
    },
    {
      key: 'hero_description',
      value: 'Free Next.js template for startup, marketing, and SaaS businesses. Comes with all the essential pages and components you need to launch your startup.',
      type: 'string',
      description: 'Hero section description text',
    },
  ]

  for (const setting of siteSettings) {
    await prisma.siteSettings.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    })
  }

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
