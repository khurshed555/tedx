import { NextResponse } from 'next/server'

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, grade, topic, telegramUserId } = body

    const message = `
New TEDx Registration:
Name: ${name}
Grade: ${grade}
Topic: ${topic}
    `

    const response = await fetch(TELEGRAM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: telegramUserId,
        text: message,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to send Telegram message')
    }

    return NextResponse.json({ success: true, message: 'Form submitted successfully' })
  } catch (error) {
    console.error('Error submitting form:', error)
    return NextResponse.json({ success: false, message: 'Error submitting form' }, { status: 500 })
  }
}