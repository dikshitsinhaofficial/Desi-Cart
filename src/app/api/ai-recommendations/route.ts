import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Product from '@/lib/models/Product';
import { env } from '@/lib/env';
import { GoogleGenAI } from '@google/genai';

export async function GET(req: NextRequest) {
  try {
    if (!env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'AI recommendations are not configured. Please add GEMINI_API_KEY to your environment variables.' },
        { status: 501 } // Not Implemented
      );
    }

    await dbConnect();

    // Fetch a slim version of the catalog to send to Gemini
    // We limit it to ~100 products to fit well within context limits
    const catalog = await Product.find({}, '_id name category price rating').limit(100).lean();

    if (catalog.length === 0) {
      return NextResponse.json({ error: 'No products available' }, { status: 404 });
    }

    const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    
    const prompt = `
      You are an expert personal shopping assistant for Desi-Cart, a premium e-commerce store.
      Below is our current product catalog (each item has an _id, name, category, price, and rating).
      Please select exactly 4 products that would make a fantastic, diverse "Top Picks" bundle for a customer.
      Return ONLY a JSON array of the 4 product _ids as strings. No markdown formatting, no explanations. Just the JSON array.
      
      Catalog:
      ${JSON.stringify(catalog, null, 2)}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const responseText = response.text || '[]';
    
    // Parse the JSON array
    let recommendedIds: string[] = [];
    try {
      // In case Gemini added markdown blocks like ```json
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      recommendedIds = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', responseText);
      return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 });
    }

    if (!Array.isArray(recommendedIds) || recommendedIds.length === 0) {
      return NextResponse.json({ error: 'Invalid recommendations format' }, { status: 500 });
    }

    // Fetch the full product details for those IDs
    const recommendedProducts = await Product.find({ _id: { $in: recommendedIds } }).lean();

    return NextResponse.json(recommendedProducts);
  } catch (error) {
    console.error('AI Recommendation Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
