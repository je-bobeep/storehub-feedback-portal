import { prisma } from './database'

const sampleFeedback = [
  {
    title: "Dark mode support",
    description: "Please add a dark mode toggle to reduce eye strain during nighttime usage. This would make the platform much more comfortable to use in low-light environments.",
    category: "BeepGPT",
    subCategory: "UI/UX",
    status: "Under Review",
    votes: 15
  },
  {
    title: "Mobile app version",
    description: "A native mobile app would make it much easier to submit feedback on the go. Push notifications for status updates would be great too.",
    category: "BeepGPT", 
    subCategory: "Platform",
    status: "In Progress",
    votes: 12
  },
  {
    title: "Export conversation history",
    description: "Allow users to export their conversation history as PDF or text files for record keeping and offline reference.",
    category: "BeepGPT",
    subCategory: "Data Management", 
    status: "Completed",
    votes: 8
  },
  {
    title: "Voice message support",
    description: "Add ability to send voice messages instead of just text. This would make the platform more accessible and convenient for many users.",
    category: "BeepGPT",
    subCategory: "Communication",
    status: "Under Review", 
    votes: 22
  },
  {
    title: "Integration with Slack",
    description: "Integrate with Slack so teams can easily collaborate and share AI-generated content directly in their workspace channels.",
    category: "BeyondWords",
    subCategory: "Integrations",
    status: "Under Review",
    votes: 6
  },
  {
    title: "Advanced search filters",
    description: "Add more sophisticated search filters including date ranges, content types, and custom tags to help users find specific information quickly.",
    category: "Beep",
    subCategory: null,
    status: "In Progress",
    votes: 9
  }
]

const sampleUsers = [
  { email: "alice@example.com", username: "alice_dev" },
  { email: "bob@example.com", username: "bob_designer" },
  { email: "charlie@example.com", username: "charlie_pm" },
  { email: "diana@example.com", username: "diana_user" },
  { email: "evan@example.com", username: "evan_tester" }
]

export async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...')

    // Clear existing data
    await prisma.vote.deleteMany()
    await prisma.feedback.deleteMany()
    await prisma.user.deleteMany()
    
    console.log('🧹 Cleared existing data')

    // Create users
    const users = await Promise.all(
      sampleUsers.map(user => 
        prisma.user.create({
          data: user
        })
      )
    )
    
    console.log(`👥 Created ${users.length} users`)

    // Create feedback items
    const feedbackItems = await Promise.all(
      sampleFeedback.map(feedback => 
        prisma.feedback.create({
          data: {
            title: feedback.title,
            description: feedback.description,
            category: feedback.category,
            subCategory: feedback.subCategory,
            status: feedback.status,
            votes: feedback.votes,
            tags: JSON.stringify([]),
            isApproved: true
          }
        })
      )
    )
    
    console.log(`📝 Created ${feedbackItems.length} feedback items`)

    // Create some sample votes
    const votes = []
    
    // Randomly assign votes from users to feedback items
    for (const feedback of feedbackItems) {
      const numVoters = Math.min(feedback.votes, users.length)
      const randomUsers = users.sort(() => 0.5 - Math.random()).slice(0, numVoters)
      
      for (const user of randomUsers) {
        votes.push({
          userId: user.id,
          feedbackId: feedback.id
        })
      }
    }

    await prisma.vote.createMany({
      data: votes
    })
    
    console.log(`🗳️ Created ${votes.length} votes`)

    console.log('✅ Database seeding completed successfully!')
    
    return {
      users: users.length,
      feedback: feedbackItems.length,
      votes: votes.length
    }
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedDatabase()
    .then((results) => {
      console.log('Seeding results:', results)
      process.exit(0)
    })
    .catch((error) => {
      console.error('Seeding failed:', error)
      process.exit(1)
    })
} 