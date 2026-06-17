import swaggerUi from 'swagger-ui-express';
import { Schema } from 'swagger-jsdoc';

const swaggerDocument: any = {
  openapi: '3.0.0',
  info: {
    title: 'Event Registration & Ticket Management API',
    version: '1.0.0',
    description: 'A robust, interview-friendly Express API for managing events and registrations built with Node.js, TypeScript, Express.js, MySQL, and Sequelize ORM.',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local development server',
    },
  ],
  paths: {
    '/events': {
      post: {
        tags: ['Events'],
        summary: 'Create a new event',
        description: 'Creates a new event with a given capacity, ticket price, location, and date.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateEventInput',
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Event created successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/EventResponse',
                },
              },
            },
          },
          400: {
            description: 'Validation failed or duplicate event name for date',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
      get: {
        tags: ['Events'],
        summary: 'List events',
        description: 'Retrieves a list of events with filtering, search, pagination, and sorting.',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Page number' },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 }, description: 'Number of records per page' },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search term (matches name or location)' },
          { name: 'location', in: 'query', schema: { type: 'string' }, description: 'Filter by exact location' },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] }, description: 'Filter by status' },
          { name: 'minPrice', in: 'query', schema: { type: 'number' }, description: 'Filter by minimum ticket price' },
          { name: 'maxPrice', in: 'query', schema: { type: 'number' }, description: 'Filter by maximum ticket price' },
          { name: 'eventDate', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Filter by event date (YYYY-MM-DD)' },
          { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['eventName', 'eventDate', 'ticketPrice', 'createdAt'], default: 'createdAt' }, description: 'Sort field' },
          { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['ASC', 'DESC'], default: 'DESC' }, description: 'Sort direction' },
        ],
        responses: {
          200: {
            description: 'Events retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/EventsListResponse',
                },
              },
            },
          },
        },
      },
    },
    '/events/{id}': {
      delete: {
        tags: ['Events'],
        summary: 'Delete an event (Soft Delete)',
        description: 'Performs a soft delete on an event. The event will not be permanently deleted, but will be marked as deleted (using deletedAt). Prevented if active or waitlisted registrations exist.',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'Event ID' },
        ],
        responses: {
          200: {
            description: 'Event deleted successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Event deleted successfully' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation failed or active registrations exist',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          404: {
            description: 'Event not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/events/{id}/summary': {
      get: {
        tags: ['Events'],
        summary: 'Get event summary',
        description: 'Returns real-time reservation metrics for a specific event.',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'Event ID' },
        ],
        responses: {
          200: {
            description: 'Event summary retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/EventSummaryResponse',
                },
              },
            },
          },
          404: {
            description: 'Event not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/registrations': {
      post: {
        tags: ['Registrations'],
        summary: 'Register for an event',
        description: 'Books tickets for an active event. Creates a waitlisted registration if tickets exceed available seats.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateRegistrationInput',
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Event registration successful or waitlisted',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/RegistrationResponse',
                },
              },
            },
          },
          400: {
            description: 'Bad request (duplicate email, inactive event, validation error)',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          404: {
            description: 'Event not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
      get: {
        tags: ['Registrations'],
        summary: 'List registrations',
        description: 'Retrieves a list of registrations with filtering, search, pagination, and sorting.',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Page number' },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 }, description: 'Number of records per page' },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search term (matches registration number, name, or email)' },
          { name: 'eventId', in: 'query', schema: { type: 'integer' }, description: 'Filter by event ID' },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['REGISTERED', 'CANCELLED', 'WAITLIST'] }, description: 'Filter by status' },
          { name: 'registrationDate', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Filter by registration date (YYYY-MM-DD)' },
          { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['registrationNumber', 'fullName', 'email', 'createdAt'], default: 'createdAt' }, description: 'Sort field' },
          { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['ASC', 'DESC'], default: 'DESC' }, description: 'Sort direction' },
        ],
        responses: {
          200: {
            description: 'Registrations retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/RegistrationsListResponse',
                },
              },
            },
          },
        },
      },
    },
    '/registrations/{id}/cancel': {
      patch: {
        tags: ['Registrations'],
        summary: 'Cancel a registration',
        description: 'Cancels a registration, releases reserved seats, and logs the change.',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'Registration ID' },
        ],
        responses: {
          200: {
            description: 'Registration cancelled successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/RegistrationResponse',
                },
              },
            },
          },
          400: {
            description: 'Registration already cancelled',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          404: {
            description: 'Registration not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/dashboard': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get dashboard statistics',
        description: 'Returns total events, active events, registrations status, total revenue, and top performing events.',
        responses: {
          200: {
            description: 'Dashboard stats retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/DashboardResponse',
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      CreateEventInput: {
        type: 'object',
        required: ['eventName', 'location', 'eventDate', 'capacity', 'ticketPrice'],
        properties: {
          eventName: { type: 'string', example: 'Tech Summit 2026' },
          location: { type: 'string', example: 'San Francisco' },
          eventDate: { type: 'string', format: 'date', example: '2026-08-15' },
          capacity: { type: 'integer', example: 500 },
          ticketPrice: { type: 'number', example: 150.00 },
          status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'], example: 'ACTIVE' },
        },
      },
      CreateRegistrationInput: {
        type: 'object',
        required: ['eventId', 'fullName', 'email', 'tickets'],
        properties: {
          eventId: { type: 'integer', example: 1 },
          fullName: { type: 'string', example: 'John Doe' },
          email: { type: 'string', format: 'email', example: 'john@example.com' },
          tickets: { type: 'integer', example: 2 },
        },
      },
      EventResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Event created successfully' },
          data: {
            type: 'object',
            properties: {
              id: { type: 'integer', example: 1 },
              eventName: { type: 'string', example: 'Tech Summit 2026' },
              location: { type: 'string', example: 'San Francisco' },
              eventDate: { type: 'string', example: '2026-08-15' },
              capacity: { type: 'integer', example: 500 },
              availableSeats: { type: 'integer', example: 500 },
              ticketPrice: { type: 'number', example: 150.00 },
              status: { type: 'string', example: 'ACTIVE' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
      EventsListResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Events retrieved successfully' },
          data: {
            type: 'object',
            properties: {
              totalItems: { type: 'integer', example: 1 },
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'integer' },
                    eventName: { type: 'string' },
                    location: { type: 'string' },
                    eventDate: { type: 'string' },
                    capacity: { type: 'integer' },
                    availableSeats: { type: 'integer' },
                    ticketPrice: { type: 'number' },
                    status: { type: 'string' },
                  },
                },
              },
              totalPages: { type: 'integer', example: 1 },
              currentPage: { type: 'integer', example: 1 },
              limit: { type: 'integer', example: 10 },
            },
          },
        },
      },
      EventSummaryResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Event summary retrieved successfully' },
          data: {
            type: 'object',
            properties: {
              eventId: { type: 'integer', example: 1 },
              eventName: { type: 'string', example: 'Tech Summit 2026' },
              capacity: { type: 'integer', example: 500 },
              registeredSeats: { type: 'integer', example: 320 },
              availableSeats: { type: 'integer', example: 180 },
              totalRevenue: { type: 'number', example: 48000.00 },
            },
          },
        },
      },
      RegistrationResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Event registration successful' },
          data: {
            type: 'object',
            properties: {
              id: { type: 'integer', example: 1 },
              registrationNumber: { type: 'string', example: 'REG-20260617-1001' },
              eventId: { type: 'integer', example: 1 },
              fullName: { type: 'string', example: 'John Doe' },
              email: { type: 'string', example: 'john@example.com' },
              tickets: { type: 'integer', example: 2 },
              totalAmount: { type: 'number', example: 300.00 },
              status: { type: 'string', example: 'REGISTERED' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
      RegistrationsListResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Registrations retrieved successfully' },
          data: {
            type: 'object',
            properties: {
              totalItems: { type: 'integer', example: 1 },
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'integer' },
                    registrationNumber: { type: 'string' },
                    eventId: { type: 'integer' },
                    fullName: { type: 'string' },
                    email: { type: 'string' },
                    tickets: { type: 'integer' },
                    totalAmount: { type: 'number' },
                    status: { type: 'string' },
                    event: {
                      type: 'object',
                      properties: {
                        id: { type: 'integer' },
                        eventName: { type: 'string' },
                        location: { type: 'string' },
                        eventDate: { type: 'string' },
                      },
                    },
                  },
                },
              },
              totalPages: { type: 'integer', example: 1 },
              currentPage: { type: 'integer', example: 1 },
              limit: { type: 'integer', example: 10 },
            },
          },
        },
      },
      DashboardResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Dashboard stats retrieved successfully' },
          data: {
            type: 'object',
            properties: {
              totalEvents: { type: 'integer', example: 50 },
              activeEvents: { type: 'integer', example: 30 },
              totalRegistrations: { type: 'integer', example: 5000 },
              cancelledRegistrations: { type: 'integer', example: 200 },
              totalRevenue: { type: 'number', example: 7500000 },
              topEvents: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    eventId: { type: 'integer' },
                    eventName: { type: 'string' },
                    location: { type: 'string' },
                    eventDate: { type: 'string' },
                    capacity: { type: 'integer' },
                    availableSeats: { type: 'integer' },
                    registeredSeats: { type: 'integer' },
                    revenue: { type: 'number' },
                  },
                },
              },
            },
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Validation failed' },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string', example: 'email' },
                message: { type: 'string', example: 'email must be a valid email' },
              },
            },
          },
        },
      },
    },
  },
};

export const serveSwagger = swaggerUi.serve;
export const swaggerUiSetup = swaggerUi.setup(swaggerDocument);
