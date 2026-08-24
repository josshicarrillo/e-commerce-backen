export default class Event {
  constructor({ title, description, date, location, price, status = 'active' }) {
    this.title = title;
    this.description = description;
    this.date = date;
    this.location = location;
    this.price = price;
    this.status = status;
  }
}
