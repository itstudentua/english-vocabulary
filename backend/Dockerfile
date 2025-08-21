# Stage 1: build
FROM golang:1.23-alpine AS build

WORKDIR /app

# Копируем зависимости
COPY go.mod go.sum ./
RUN go mod download

# Копируем все исходники
COPY . .

# Собираем бинарник
RUN go build -o backend .

# Stage 2: minimal runtime
FROM alpine:latest
WORKDIR /app
COPY --from=build /app/backend .
EXPOSE 8080
CMD ["./backend"]
