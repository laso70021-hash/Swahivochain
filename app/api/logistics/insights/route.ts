import { GoogleGenAI, Type } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Initialize the Google GenAI client with server-side API key
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured');
  }
  return new GoogleGenAI({ apiKey });
};

interface LogisticsAnalysisPayload {
  userId: string;
  userRole?: string;
  company?: string;
  shipments: Array<{
    id: string;
    trackingNumber: string;
    customer: string;
    origin: string;
    destination: string;
    status: string;
    mode?: string;
    carrier?: string;
    shipmentDate?: string;
    expectedDeliveryDate?: string;
    cargoInfo?: string;
    quantity?: number;
    weight?: string;
    currentLocation?: string;
    events?: Array<{
      time: string;
      title: string;
      location: string;
      completed: boolean;
    }>;
  }>;
  orders?: Array<{
    id: string;
    orderNumber: string;
    clientName: string;
    title: string;
    status: string;
    orderDate?: string;
    deliveryDeadline?: string;
    totalAmount?: number;
    currency?: string;
    origin?: string;
    destination?: string;
  }>;
  pickups?: Array<{
    id: string;
    pickupAddress: string;
    pickupDate: string;
    timeSlot?: string;
    packageCount?: number;
    cargoType?: string;
    status: string;
  }>;
}

export async function POST(req: NextRequest) {
  try {
    const body: LogisticsAnalysisPayload = await req.json();

    if (!body || !body.userId) {
      return NextResponse.json(
        { error: 'Unauthorized: User identifier is required for logistics analysis' },
        { status: 400 }
      );
    }

    const { shipments = [], orders = [], pickups = [], userRole = 'Customer', company = 'Organization' } = body;

    // Check if there is meaningful logistics data
    if (shipments.length === 0 && orders.length === 0 && pickups.length === 0) {
      return NextResponse.json({
        health: {
          score: 100,
          status: 'Optimal',
          summary: 'No active shipments or pending orders found in your logistics pipeline.',
        },
        delaysAndRisks: [],
        operationalIssues: [],
        upcomingAttentionItems: [],
        recommendedActions: [
          'Register your first inbound or outbound shipment to start monitoring transport telemetry.',
          'Schedule a cargo pickup or create an order linked to a consignee client.',
        ],
        analyzedAt: new Date().toISOString(),
        shipmentsCount: 0,
        ordersCount: 0,
      });
    }

    const ai = getAiClient();

    // Prepare structured context payload summarizing the user's authorized data
    const contextSummary = {
      userRole,
      company,
      totalShipments: shipments.length,
      shipmentBreakdown: {
        pending: shipments.filter((s) => s.status === 'Pending').length,
        processing: shipments.filter((s) => s.status === 'Processing').length,
        inTransit: shipments.filter((s) => s.status === 'In Transit').length,
        delivered: shipments.filter((s) => s.status === 'Delivered').length,
        cancelled: shipments.filter((s) => s.status === 'Cancelled').length,
      },
      shipments: shipments.slice(0, 15).map((s) => ({
        trackingNumber: s.trackingNumber,
        consignee: s.customer,
        origin: s.origin,
        destination: s.destination,
        status: s.status,
        mode: s.mode,
        carrier: s.carrier,
        dispatchDate: s.shipmentDate,
        eta: s.expectedDeliveryDate,
        cargo: s.cargoInfo,
        telematicsLocation: s.currentLocation,
        latestEvent: s.events && s.events.length > 0 ? s.events[s.events.length - 1] : undefined,
      })),
      totalOrders: orders.length,
      orders: orders.slice(0, 10).map((o) => ({
        orderNumber: o.orderNumber,
        client: o.clientName,
        title: o.title,
        status: o.status,
        orderDate: o.orderDate,
        deadline: o.deliveryDeadline,
        value: `${o.totalAmount} ${o.currency || 'USD'}`,
        origin: o.origin,
        destination: o.destination,
      })),
      totalPickups: pickups.length,
      pickups: pickups.slice(0, 5).map((p) => ({
        address: p.pickupAddress,
        date: p.pickupDate,
        slot: p.timeSlot,
        cargo: p.cargoType,
        status: p.status,
      })),
    };

    const systemPrompt = `You are the Lead Supply Chain Intelligence Analyst for Logistics Chain, an enterprise multimodal freight orchestration platform.
Analyze the user's authorized logistics operation data provided in JSON.

Generate a concise, highly actionable, professional operational assessment adhering strictly to the response schema.

Key areas to cover:
1. Operation Health: Overall logistics health status ('Optimal' | 'Caution' | 'Action Required') and a 0-100 score, with a 1-2 sentence executive summary.
2. Important Delays or Risks: Flag specific shipments with past-due ETAs, corridor bottlenecks, weather or customs friction, or high-value consignments.
3. Potential Operational Issues: Address potential friction in fulfillment, pickup scheduling windows, or transit handoffs.
4. Upcoming Items Requiring Attention: Highlight deliveries arriving in the next 24-72 hours, customs sign-offs, or open pickup dispatches.
5. Specific Recommended Actions: Provide 3 to 5 concrete, prioritized steps the user can execute immediately in their control dashboard.

Tone: Decisive, professional, data-grounded, and concise. Avoid fluff or generic boilerplate. Reference specific tracking numbers, orders, or locations when relevant.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Here is the current operational logistics dataset for ${company} (${userRole} view):\n\n${JSON.stringify(
                contextSummary,
                null,
                2
              )}\n\nPlease provide an on-demand logistics health and intelligence report.`,
            },
          ],
        },
      ],
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.2,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            health: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.INTEGER, description: 'Overall operational health index from 0 to 100' },
                status: {
                  type: Type.STRING,
                  enum: ['Optimal', 'Good', 'Caution', 'Critical'],
                  description: 'Overall operational posture',
                },
                summary: { type: Type.STRING, description: '1-2 sentence high-level executive health assessment' },
              },
              required: ['score', 'status', 'summary'],
            },
            delaysAndRisks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  severity: { type: Type.STRING, enum: ['Low', 'Medium', 'High', 'Critical'] },
                  description: { type: Type.STRING },
                  relatedEntity: { type: Type.STRING, description: 'Tracking code, order number, or corridor' },
                },
                required: ['title', 'severity', 'description'],
              },
            },
            operationalIssues: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING, description: 'Customs, Telematics, Transit, Fulfillment, or Carrier' },
                  description: { type: Type.STRING },
                  impact: { type: Type.STRING },
                },
                required: ['category', 'description', 'impact'],
              },
            },
            upcomingAttentionItems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  deadlineOrEta: { type: Type.STRING },
                  subject: { type: Type.STRING },
                  urgency: { type: Type.STRING, enum: ['Normal', 'Urgent', 'Immediate'] },
                  details: { type: Type.STRING },
                },
                required: ['subject', 'details', 'urgency'],
              },
            },
            recommendedActions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3-5 prioritized, concrete actionable recommendations',
            },
          },
          required: [
            'health',
            'delaysAndRisks',
            'operationalIssues',
            'upcomingAttentionItems',
            'recommendedActions',
          ],
        },
      },
    });

    const rawText = response.text || '{}';
    const parsedData = JSON.parse(rawText);

    return NextResponse.json({
      ...parsedData,
      analyzedAt: new Date().toISOString(),
      shipmentsCount: shipments.length,
      ordersCount: orders.length,
      pickupsCount: pickups.length,
    });
  } catch (error) {
    console.error('Error generating AI logistics insights:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { error: `Logistics analysis error: ${errorMessage}` },
      { status: 500 }
    );
  }
}
