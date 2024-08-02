import { PrismaClient } from "@prisma/client";
import { z } from "zod";

import { apikeySchema } from "@/lib/schemas";

const prisma = new PrismaClient();

const timeSchema = z.object({
  apikey: apikeySchema,
  gamertag: z.string({
    required_error: "gamertag is required",
    invalid_type_error: "gamertag must be a string",
  }),
});

type TimeSchema = Omit<z.infer<typeof timeSchema>, "apikey">;

export async function GET(
  request: Request,
  { params }: { params: TimeSchema }
) {
  const { searchParams } = new URL(request.url);

  const response = timeSchema.safeParse({
    apikey: searchParams.get("apikey"),
    gamertag: params.gamertag,
  });

  if (!response.success) {
    const { errors } = response.error;

    return Response.json(
      {
        error: { errors },
      },
      {
        status: 400,
      }
    );
  }

  if (searchParams.get("apikey") !== process.env.API_KEY) {
    return Response.json(
      { success: false, data: "Invalid API key" },
      {
        status: 401,
      }
    );
  }

  try {
    const times = await prisma.time.findMany({
      where: {
        gamertag: response.data.gamertag,
      },
    });

    if (times.length) {
      return Response.json({ success: true, data: { times } }, { status: 200 });
    } else {
      return Response.json(
        {
          success: false,
          data: { times: `No times set for this gamertag` },
        },
        { status: 200 }
      );
    }
  } catch (error) {
    return Response.json({ success: false }, { status: 400 });
  }
}
