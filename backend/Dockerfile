FROM golang:alpine AS builder

WORKDIR /app

COPY . .
RUN go mod download

# _____________________________________________________

# TODO If Running Production Server            (Release)

# ____________________________________________________

RUN CGO_ENABLED=0 GOOS=linux go build -o server ./main.go
RUN chmod +x server

FROM alpine:latest
WORKDIR /app
RUN apk update && apk --no-cache add ca-certificates
RUN update-ca-certificates
COPY --from=builder /app/server ./

EXPOSE 1323

CMD [ "./server" ]
