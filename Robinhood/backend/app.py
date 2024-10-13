from collections import defaultdict
import os
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
import yfinance as yf
import openai
from models import StockData, db, Stock, SoldStock, PortfolioHistory
from dotenv import load_dotenv
from flask_socketio import SocketIO, emit
from datetime import datetime, timedelta
from sqlalchemy import func 

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing for the app
socketio = SocketIO(app, cors_allowed_origins="*")  # Enable WebSocket support with CORS

# Configurations for the SQLAlchemy database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///../database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize the database with the Flask app
db.init_app(app)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def update_portfolio_and_emit():
    """
    Update the portfolio data and emit it through WebSocket.
    This function fetches the latest stock data, calculates the total portfolio value,
    and sends the updated information to connected clients.
    """
    portfolio = Stock.query.all()
    total_value = 0
    portfolio_data = {'bought_stocks': [], 'total_value': 0}

    for stock in portfolio:
        current_price = get_current_price(stock.ticker)
        stock_value = current_price * stock.quantity
        total_value += stock_value

        portfolio_data['bought_stocks'].append({
            'ticker': stock.ticker,
            'quantity': stock.quantity,
            'current_price': current_price,
            'stock_value': stock_value
        })

    portfolio_data['total_value'] = total_value
    socketio.emit('portfolioUpdated', portfolio_data)
    logger.info(f"Emitted portfolio update: {portfolio_data}")

def get_current_price(ticker):
    """
    Get the current price for a given stock ticker.
    This function checks the database first, and if the data is not available or outdated,
    it fetches the latest price from yfinance.
    """
    stock_data = StockData.query.filter_by(symbol=ticker).first()
    if stock_data and stock_data.current_price is not None:
        return stock_data.current_price
    
    try:
        yf_stock = yf.Ticker(ticker)
        current_price = yf_stock.info.get('currentPrice')
        if current_price is None:
            raise ValueError(f"Unable to fetch current price for {ticker}")
        
        update_stock_data(ticker, current_price)
        return current_price
    except Exception as e:
        logger.error(f"Error fetching data for {ticker}: {str(e)}")
        return 0

def update_stock_data(ticker, current_price):
    """
    Update or create StockData in the database.
    """
    stock_data = StockData.query.filter_by(symbol=ticker).first()
    if stock_data:
        stock_data.current_price = current_price
        stock_data.last_updated = datetime.utcnow()
    else:
        stock_data = StockData(symbol=ticker, current_price=current_price)
        db.session.add(stock_data)
    db.session.commit()

@app.route('/query', methods=['GET'])
def query_stock():
    """
    Endpoint to query stock information using yfinance.
    Accepts a 'ticker' as a query parameter and returns the stock's symbol, current price, previous close, and market cap.
    """
    ticker = request.args.get('ticker')
    try:
        stock = yf.Ticker(ticker)
        info = stock.info
        if info:
            symbol = info.get('symbol', '')
            current_price = info.get('currentPrice')
            previous_close = info.get('previousClose')
            market_cap = info.get('marketCap')
            
            daily_change = ((current_price - previous_close) / previous_close * 100) if previous_close else None
            
            stock_info = {
                'symbol': symbol,
                'currentPrice': current_price,
                'previousClose': previous_close,
                'marketCap': market_cap,
                'dailyChange': daily_change
            }
            
            update_stock_data(symbol, current_price)
            
            return jsonify(stock_info), 200
        else:
            return jsonify({'error': 'No information available for the provided ticker'}), 404
    except ValueError as ve:
        return jsonify({'error': f'Invalid ticker symbol: {ticker}'}), 400
    except Exception as e:
        return jsonify({'error': f'Failed to fetch stock information: {str(e)}'}), 500

@app.route('/buy', methods=['POST'])
def buy_stock():
    """
    Endpoint to buy a stock.
    Accepts JSON data with 'ticker' and 'quantity', updates the database, and emits an updated portfolio via WebSocket.
    """
    data = request.get_json()
    ticker = data['ticker'].upper()
    quantity = data['quantity']
    date_bought = datetime.now()

    try:
        current_price = get_current_price(ticker)
        
        if current_price == 0:
            return jsonify({'error': 'Unable to fetch current price for the stock'}), 400

        stock = Stock.query.filter(func.lower(Stock.ticker) == func.lower(ticker)).first()
        if stock:
            stock.quantity += quantity
            stock.date_bought = date_bought
        else:
            stock = Stock(ticker=ticker, quantity=quantity, date_bought=date_bought)
            db.session.add(stock)

        db.session.commit()
        update_portfolio_and_emit()

        return jsonify({'message': 'Stock purchased successfully', 'time': date_bought.strftime('%Y-%m-%d %H:%M:%S')})

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error buying stock: {str(e)}")
        return jsonify({'error': f'Failed to buy stock: {str(e)}'}), 500

@app.route('/sell', methods=['POST'])
def sell_stock():
    """
    Endpoint to sell a stock.
    Accepts JSON data with 'ticker' and 'quantity', updates the database, and emits an updated portfolio via WebSocket.
    """
    data = request.get_json()
    ticker = data['ticker']
    quantity = data['quantity']
    date_sold = datetime.now()

    try:
        stock = Stock.query.filter_by(ticker=ticker).first()
        if stock:
            if stock.quantity >= quantity:
                stock.quantity -= quantity
                if stock.quantity == 0:
                    db.session.delete(stock)
                
                sold_stock = SoldStock(ticker=ticker, quantity=quantity, date_sold=date_sold)
                db.session.add(sold_stock)
                
                db.session.commit()
                update_portfolio_and_emit()

                return jsonify({'message': 'Stock sold successfully', 'time': date_sold.strftime('%Y-%m-%d %H:%M:%S')})
            else:
                return jsonify({'error': 'Not enough quantity to sell'}), 400
        else:
            return jsonify({'error': 'Stock not found in portfolio'}), 404

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error selling stock: {str(e)}")
        return jsonify({'error': f'Failed to sell stock: {str(e)}'}), 500

def update_portfolio_history(total_value):
    """
    Update the portfolio history with the current total value.
    """
    new_entry = PortfolioHistory(total_value=total_value)
    db.session.add(new_entry)
    db.session.commit()

@app.route('/portfolio', methods=['GET'])
def view_portfolio():
    """
    Endpoint to view the current portfolio with total value.
    Also updates the portfolio history.
    """
    portfolio = Stock.query.all()
    sold_portfolio = SoldStock.query.all()

    total_value = 0
    portfolio_list = []

    for stock in portfolio:
        current_price = get_current_price(stock.ticker)
        stock_value = current_price * stock.quantity
        total_value += stock_value

        portfolio_list.append({
            'ticker': stock.ticker,
            'quantity': stock.quantity,
            'date_bought': stock.date_bought.strftime('%Y-%m-%d %H:%M:%S'),
            'current_price': current_price,
            'stock_value': stock_value
        })

    sold_list = [{'ticker': stock.ticker, 'quantity': stock.quantity, 'date_sold': stock.date_sold.strftime('%Y-%m-%d %H:%M:%S')} for stock in sold_portfolio]

    update_portfolio_history(total_value)

    return jsonify({
        'bought_stocks': portfolio_list,
        'sold_stocks': sold_list,
        'total_value': total_value
    })

@app.route('/portfolio/history', methods=['GET'])
def get_portfolio_history():
    """
    Endpoint to retrieve the portfolio value history.
    """
    days = request.args.get('days', default=30, type=int)
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)

    history = PortfolioHistory.query.filter(
        PortfolioHistory.date >= start_date,
        PortfolioHistory.date <= end_date
    ).order_by(PortfolioHistory.date).all()

    history_data = [{'date': entry.date.isoformat(), 'value': entry.total_value} for entry in history]

    return jsonify(history_data)

def generate_portfolio_review(portfolio_data):
    """
    Generates a portfolio review using OpenAI's GPT-3.5-turbo model.
    Aggregates the quantities for each stock ticker and sends a formatted string to OpenAI for review.
    """
    bought_stocks_review = "Bought Stocks:\n" + "\n".join(
        f"{stock['ticker']}: {stock['quantity']} (Bought on {stock['date_bought']})"
        for stock in portfolio_data['bought_stocks']
    )
    
    sold_stocks_review = "Sold Stocks:\n" + "\n".join(
        f"{stock['ticker']}: {stock['quantity']} (Sold on {stock['date_sold']})"
        for stock in portfolio_data['sold_stocks']
    )
        
    portfolio_review = f"Please review this purchased stock portfolio. These stocks are currently held and have not been sold yet.\n\n{bought_stocks_review}\n\nAnd please review these stocks that have been sold.\n\n{sold_stocks_review}"
        
    load_dotenv()
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    openai.api_key = OPENAI_API_KEY   
    
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {
                "role": "user",
                "content": portfolio_review,
            }
        ]
    )

    return response.choices[0].message['content']

@app.route('/portfolio/review', methods=['POST'])
def get_portfolio_review():
    """
    Endpoint to get a portfolio review.
    Accepts a JSON body with 'portfolio_data' and returns the generated review.
    """
    portfolio_data = request.json.get('portfolio_data')
    review = generate_portfolio_review(portfolio_data)
    return review

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    socketio.run(app, debug=True)