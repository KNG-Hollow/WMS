[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

# Warehouse Management System

A centralized digital workstation for easily managing all Account, Product, Inventory, Outgoing Order, and Incoming Shipment services.

## Introduction

This project uses _Postgresql_ for the Database Management System, _Go/Echo_ for the API Service, and _TypeScript/React_ for the User Interface. The _Backend & Frontend_ can be containerized individually with Docker by using each respective folder's Dockerfile, or ran as a complete service with the root directory's compose.yaml using Docker Compose. The _/database_ folder contains helper scripts to populate a _Postgresql_ database with the tables needed to interact with the backend API, and some test data for previewing the application. The _/k8s_ folder contains Kubernetes configuration files to run in a cluster.

## How To Use

// TODO //

## Features In-Progress

- BACKEND
  - // Break down 'Routers', 'Controllers', 'Services' files into their separate microservices
  - // Role Based Security
  - // Instead of using the CheckCache function before each call, have redis try to get the query and if it doesnt return, have the database query
  - // Redis for session and page-caching to reduce server load
  - // Redis to store online user information
  - // Redis to store image data
  - // Backend Homepage To Give Restricted Summary Data To Admins
  - // Search Engine for Query Interface
  - // autotls with Let's Encrypt for production ssl keys and certs

- FRONTEND
  - // Query Interface for Search Engine

- DATABASE
  - // Relate all tables to the columns they reference

- Make production and development builds
