import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Receively API',
      version: '1.0.0',
      description: 'Invoice management system API documentation',
      contact: {
        name: 'Receively Support',
        email: 'support@receively.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Development server'
      },
      {
        url: 'https://api.receively.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  example: 'VALIDATION_ERROR'
                },
                message: {
                  type: 'string',
                  example: 'Invalid input data'
                }
              }
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            self_name: {
              type: 'string',
              example: 'John Doe'
            },
            user_email: {
              type: 'string',
              format: 'email',
              example: 'john@example.com'
            },
            business_name: {
              type: 'string',
              example: "John's Consulting"
            },
            currency: {
              type: 'string',
              example: 'USD'
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Client: {
          type: 'object',
          properties: {
            client_id: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000'
            },
            user_id: {
              type: 'string',
              format: 'uuid'
            },
            name: {
              type: 'string',
              example: 'Acme Corporation'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'contact@acme.com'
            },
            company_name: {
              type: 'string',
              example: 'Acme Corp'
            },
            billing_address: {
              type: 'string',
              example: '123 Main St, New York, NY 10001'
            },
            default_currency: {
              type: 'string',
              example: 'USD'
            },
            notes: {
              type: 'string',
              example: 'Preferred client'
            },
            archived_at: {
              type: 'string',
              format: 'date-time',
              nullable: true
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            },
            updated_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        // Add to apps/api/src/config/swagger.js - inside schemas object

Invoice: {
  type: 'object',
  properties: {
    invoice_id: {
      type: 'string',
      format: 'uuid',
      example: '550e8400-e29b-41d4-a716-446655440000'
    },
    user_id: {
      type: 'string',
      format: 'uuid'
    },
    client_id: {
      type: 'string',
      format: 'uuid'
    },
    invoice_number: {
      type: 'string',
      example: 'JD-2024-015'
    },
    status: {
      type: 'string',
      enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
      example: 'sent'
    },
    is_draft: {
      type: 'boolean',
      example: false
    },
    issue_date: {
      type: 'string',
      format: 'date',
      example: '2024-01-15'
    },
    due_date: {
      type: 'string',
      format: 'date',
      example: '2024-02-15'
    },
    currency: {
      type: 'string',
      example: 'USD'
    },
    notes: {
      type: 'string',
      example: 'Payment terms: Net 30'
    },
    subtotal: {
      type: 'number',
      format: 'decimal',
      example: 1120.00
    },
    tax_rate: {
      type: 'number',
      format: 'decimal',
      example: 18.00
    },
    tax_amount: {
      type: 'number',
      format: 'decimal',
      example: 181.44
    },
    discount_type: {
      type: 'string',
      enum: ['none', 'percentage', 'fixed'],
      example: 'percentage'
    },
    discount_value: {
      type: 'number',
      format: 'decimal',
      example: 10.00
    },
    discount_amount: {
      type: 'number',
      format: 'decimal',
      example: 112.00
    },
    total_amount: {
      type: 'number',
      format: 'decimal',
      example: 1189.44
    },
    paid_amount: {
      type: 'number',
      format: 'decimal',
      example: 0
    },
    balance: {
      type: 'number',
      format: 'decimal',
      example: 1189.44
    },
    sent_at: {
      type: 'string',
      format: 'date-time',
      nullable: true
    },
    last_saved_at: {
      type: 'string',
      format: 'date-time'
    },
    created_at: {
      type: 'string',
      format: 'date-time'
    },
    updated_at: {
      type: 'string',
      format: 'date-time'
    }
  }
},

InvoiceItem: {
  type: 'object',
  properties: {
    item_id: {
      type: 'string',
      format: 'uuid',
      example: '660e8400-e29b-41d4-a716-446655440001'
    },
    invoice_id: {
      type: 'string',
      format: 'uuid'
    },
    description: {
      type: 'string',
      example: 'Website Design'
    },
    quantity: {
      type: 'number',
      format: 'decimal',
      example: 1.00
    },
    unit_price: {
      type: 'number',
      format: 'decimal',
      example: 1000.00
    },
    subtotal: {
      type: 'number',
      format: 'decimal',
      example: 1000.00
    },
    item_order: {
      type: 'integer',
      example: 0
    },
    created_at: {
      type: 'string',
      format: 'date-time'
    }
  }
},

InvoiceWithDetails: {
  allOf: [
    { $ref: '#/components/schemas/Invoice' },
    {
      type: 'object',
      properties: {
        client: {
          type: 'object',
          properties: {
            client_id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'Acme Corp' },
            email: { type: 'string', example: 'contact@acme.com' },
            company_name: { type: 'string', example: 'Acme Corporation' },
            billing_address: { type: 'string' }
          }
        },
        items: {
          type: 'array',
          items: {
            $ref: '#/components/schemas/InvoiceItem'
          }
        }
      }
    }
  ]
},

InvoiceCreateRequest: {
  type: 'object',
  required: ['client_id', 'items'],
  properties: {
    client_id: {
      type: 'string',
      format: 'uuid',
      example: '123e4567-e89b-12d3-a456-426614174000'
    },
    invoice_number: {
      type: 'string',
      example: 'JD-2024-015',
      description: 'Auto-generated if not provided'
    },
    issue_date: {
      type: 'string',
      format: 'date',
      example: '2024-01-15',
      description: 'Defaults to today'
    },
    due_date: {
      type: 'string',
      format: 'date',
      example: '2024-02-15',
      description: 'Defaults to 30 days from issue_date'
    },
    currency: {
      type: 'string',
      example: 'USD',
      description: 'Defaults to client currency'
    },
    notes: {
      type: 'string',
      example: 'Payment terms: Net 30'
    },
    tax_rate: {
      type: 'number',
      format: 'decimal',
      example: 18.00,
      default: 0
    },
    discount_type: {
      type: 'string',
      enum: ['none', 'percentage', 'fixed'],
      example: 'percentage',
      default: 'none'
    },
    discount_value: {
      type: 'number',
      format: 'decimal',
      example: 10.00,
      default: 0
    },
    items: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        required: ['description', 'quantity', 'unit_price'],
        properties: {
          description: {
            type: 'string',
            example: 'Website Design'
          },
          quantity: {
            type: 'number',
            format: 'decimal',
            example: 1,
            minimum: 0.01
          },
          unit_price: {
            type: 'number',
            format: 'decimal',
            example: 1000.00,
            minimum: 0
          }
        }
      }
    }
  }
},

InvoiceUpdateRequest: {
  type: 'object',
  properties: {
    client_id: {
      type: 'string',
      format: 'uuid'
    },
    invoice_number: {
      type: 'string'
    },
    issue_date: {
      type: 'string',
      format: 'date'
    },
    due_date: {
      type: 'string',
      format: 'date'
    },
    currency: {
      type: 'string'
    },
    notes: {
      type: 'string'
    },
    tax_rate: {
      type: 'number',
      format: 'decimal'
    },
    discount_type: {
      type: 'string',
      enum: ['none', 'percentage', 'fixed']
    },
    discount_value: {
      type: 'number',
      format: 'decimal'
    },
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          item_id: {
            type: 'string',
            format: 'uuid',
            description: 'Include for existing items to update'
          },
          description: {
            type: 'string'
          },
          quantity: {
            type: 'number',
            format: 'decimal'
          },
          unit_price: {
            type: 'number',
            format: 'decimal'
          }
        }
      }
    }
  }
},

InvoiceListItem: {
  type: 'object',
  properties: {
    invoice_id: {
      type: 'string',
      format: 'uuid'
    },
    invoice_number: {
      type: 'string',
      example: 'JD-2024-001'
    },
    client: {
      type: 'object',
      properties: {
        client_id: { type: 'string', format: 'uuid' },
        name: { type: 'string', example: 'Acme Corp' },
        email: { type: 'string', example: 'contact@acme.com' }
      }
    },
    status: {
      type: 'string',
      example: 'sent'
    },
    is_draft: {
      type: 'boolean'
    },
    total_amount: {
      type: 'number',
      example: 1189.44
    },
    paid_amount: {
      type: 'number',
      example: 0
    },
    balance: {
      type: 'number',
      example: 1189.44
    },
    currency: {
      type: 'string',
      example: 'USD'
    },
    issue_date: {
      type: 'string',
      format: 'date'
    },
    due_date: {
      type: 'string',
      format: 'date'
    },
    sent_at: {
      type: 'string',
      format: 'date-time',
      nullable: true
    },
    created_at: {
      type: 'string',
      format: 'date-time'
    }
  }
},

NextInvoiceNumber: {
  type: 'object',
  properties: {
    invoice_number: {
      type: 'string',
      example: 'JD-2024-015'
    },
    prefix: {
      type: 'string',
      example: 'JD'
    },
    year: {
      type: 'integer',
      example: 2024
    },
    sequence: {
      type: 'integer',
      example: 15
    },
    format: {
      type: 'string',
      example: '{prefix}-{year}-{sequence}'
    },
    editable: {
      type: 'boolean',
      example: true
    }
  }
},

PaymentRecordRequest: {
  type: 'object',
  required: ['amount', 'payment_date'],
  properties: {
    amount: {
      type: 'number',
      format: 'decimal',
      example: 500.00,
      minimum: 0.01
    },
    payment_date: {
      type: 'string',
      format: 'date',
      example: '2024-01-20'
    },
    payment_method: {
      type: 'string',
      example: 'bank_transfer'
    },
    notes: {
      type: 'string',
      example: 'Partial payment received'
    }
  }
},

InvoiceStatusUpdate: {
  type: 'object',
  required: ['status'],
  properties: {
    status: {
      type: 'string',
      enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
      example: 'cancelled'
    },
    reason: {
      type: 'string',
      example: 'Client requested cancellation'
    }
  }
},

Pagination: {
  type: 'object',
  properties: {
    total: {
      type: 'integer',
      example: 45
    },
    page: {
      type: 'integer',
      example: 1
    },
    limit: {
      type: 'integer',
      example: 20
    },
    totalPages: {
      type: 'integer',
      example: 3
    },
    hasMore: {
      type: 'boolean',
      example: true
    }
  }
},
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;

