import {NextResponse} from 'next/server';
import OpenAI from 'openai';

const systemPrompt = `
You are a Career Mentor chatbot designed to assist users with career-related questions and tasks. Your main responsibilities include:
1. Providing career advice based on user interests and industry trends.
2. Offering job search strategies tailored to the user's goals and experience level.
3. Assisting with resume building by suggesting improvements and formatting tips.
4. Preparing users for interviews by offering common questions, best practices, and mock interview scenarios.
5. Recommending resources for further career development, such as courses and networking opportunities.

Maintain a supportive and professional tone throughout the conversation. Ensure that all advice is actionable and relevant to the user's career aspirations and current situation.
`;

export async function POST(req) {
    const openai = new OpenAI()
    const data = await req.json()

    const completion = await openai.chat.completions.create({
        messages: [
            {
            role: 'system',
            content: systemPrompt,
        },
        ...data,
    
    ],
    model: 'gpt-3.5-turbo',
    stream: true,
    })

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder()
            try{
                for await (const chunk of completion){
                    const content = chunk.choices[0]?.delta?.content
                    if (content){
                        const text = encoder.encode(content)
                        controller.enqueue(text)
                    }
                }
            } catch (err){
                controller.error(err)
            } finally{
                controller.close()
            }
        },
    })

    return new NextResponse(stream)
}
