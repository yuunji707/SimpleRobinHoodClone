from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

# Initialize SQLAlchemy for database interactions
db = SQLAlchemy()

class Stock(db.Model):
    """
    Represents a stock currently held in the portfolio.
    """
    id = db.Column(db.Integer, primary_key=True)
    ticker = db.Column(db.String(10), nullable=False, index=True)
    quantity = db.Column(db.Integer, nullable=False)
    date_bought = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f'<Stock {self.ticker}: {self.quantity}>'

class SoldStock(db.Model):
    """
    Represents a stock that has been sold from the portfolio.
    """
    id = db.Column(db.Integer, primary_key=True)
    ticker = db.Column(db.String(10), nullable=False, index=True)
    quantity = db.Column(db.Integer, nullable=False)
    date_sold = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f'<SoldStock {self.ticker}: {self.quantity}>'

class StockData(db.Model):
    """
    Stores the latest queried information for a stock.
    """
    id = db.Column(db.Integer, primary_key=True)
    symbol = db.Column(db.String(10), nullable=False, unique=True, index=True)
    current_price = db.Column(db.Float)
    previous_close = db.Column(db.Float)
    market_cap = db.Column(db.Float)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<StockData {self.symbol}: ${self.current_price}>'

class PortfolioHistory(db.Model):
    """
    Tracks the historical total value of the portfolio over time.
    """
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)
    total_value = db.Column(db.Float, nullable=False)

    def __repr__(self):
        return f'<PortfolioHistory {self.date.date()}: ${self.total_value:.2f}>'
