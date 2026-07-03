import { Injectable } from '@nestjs/common';
import { faker } from '@faker-js/faker';

@Injectable()
export class SchemaFakerService {
  generateData(schema: { type: 'array' | 'object'; fields: string[] }, resourceName: string = 'res') {
    if (schema.type === 'array') {
      const count = faker.number.int({ min: 3, max: 8 });
      return Array.from({ length: count }, () => this.generateObject(schema.fields, resourceName));
    }
    return this.generateObject(schema.fields, resourceName);
  }

  generateObject(fields: string[], resourceName: string) {
    const obj: any = {};
    for (const field of fields) {
      obj[field] = this.fakeField(field, resourceName);
    }
    return obj;
  }

  private fakeField(field: string, resourceName: string): any {
    const lower = field.toLowerCase();

    if (lower === 'id' || lower.endsWith('_id')) {
      return `${resourceName}_${faker.string.nanoid(8)}`;
    }
    if (lower.includes('name')) {
      return lower.includes('company') ? faker.company.name() : faker.person.fullName();
    }
    if (lower.includes('email')) {
      return faker.internet.email();
    }
    if (lower.includes('price')) {
      return parseFloat(faker.commerce.price());
    }
    if (lower.includes('rating')) {
      return faker.number.float({ min: 1, max: 5, fractionDigits: 1 });
    }
    if (lower.includes('cuisine')) {
      return faker.helpers.arrayElement(['Italian', 'Mexican', 'Japanese', 'Indian', 'American', 'Thai']);
    }
    if (lower.includes('category')) {
      return faker.commerce.department();
    }
    if (lower === 'item' || lower === 'title') {
      return faker.commerce.productName();
    }
    if (lower.includes('description')) {
      return faker.commerce.productDescription();
    }
    if (lower === 'eta' || lower.includes('time') || lower.includes('date')) {
      return faker.date.soon().toISOString();
    }
    if (lower.includes('phone')) {
      return faker.phone.number();
    }
    if (lower.includes('address')) {
      return faker.location.streetAddress();
    }
    if (lower.includes('image') || lower.includes('url')) {
      return faker.image.url();
    }
    if (lower.includes('status')) {
      return faker.helpers.arrayElement(['active', 'inactive', 'pending', 'completed']);
    }
    if (lower.includes('amount') || lower.includes('total')) {
      return parseFloat(faker.commerce.price({ min: 10, max: 1000 }));
    }
    if (lower.includes('count') || lower.includes('quantity') || lower === 'qty') {
      return faker.number.int({ min: 1, max: 10 });
    }

    return faker.lorem.word();
  }
}
