from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import categories, products

app = FastAPI(
    title="WorldOfLamps — Products Service",
    description="Микросервис управления товарами и категориями",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(categories.router, prefix="/api/products")
app.include_router(products.router, prefix="/api/products")


@app.get("/health")
async def health():
    return {"status": "ok", "service": "products"}
