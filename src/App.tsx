import React, { Component } from 'react';
import DataStreamer, { ServerRespond } from './DataStreamer';
import Graph from './Graph';
import './App.css';

/**
 * State declaration for <App />
 */
interface IState {
  data: ServerRespond[],
  showGraph: boolean, // Add this to control visibility of the graph
}

/**
 * The parent element of the react app.
 * It renders title, button and Graph react element.
 */
class App extends Component<{}, IState> {
  constructor(props: {}) {
    super(props);

    this.state = {
      data: [],
      showGraph: false, // Initialize graph as hidden
    };
  }

  /**
   * Aggregate existing data and update the state with unique data
   */
  aggregateData(data: ServerRespond[]): ServerRespond[] {
    const aggregatedMap = new Map<string, ServerRespond>();

    data.forEach((item) => {
      const key = `${item.stock}-${item.timestamp}`;
      if (!aggregatedMap.has(key)) {
        aggregatedMap.set(key, item);
      } else {
        // Aggregate existing entry
        const existing = aggregatedMap.get(key)!;
        existing.top_ask.price = (existing.top_ask.price + item.top_ask.price) / 2;
        existing.top_bid.price = (existing.top_bid.price + item.top_bid.price) / 2;
      }
    });

    return Array.from(aggregatedMap.values());
  }

  /**
   * Render Graph react component with state.data parsed as property data
   */
  renderGraph() {
    return (<Graph data={this.state.data}/>)
  }

  /**
   * Get new data from server and update the state with the new data
   */
  getDataFromServer() {
    DataStreamer.getData((serverResponds: ServerRespond[]) => {
      // Aggregate data to remove duplicates and update state
      const aggregatedData = this.aggregateData(serverResponds);
      this.setState({ data: [...this.state.data, ...aggregatedData] });
    });
  }

  /**
   * Start streaming data at regular intervals
   */
  startStreaming() {
    this.setState({ showGraph: true });
    this.getDataFromServer(); // Initial data fetch
    // Fetch new data every 100ms
    setInterval(() => this.getDataFromServer(), 100);
  }

  /**
   * Render the App react component
   */
  render() {
    return (
      <div className="App">
        <header className="App-header">
          Bank & Merge Co Task 2
        </header>
        <div className="App-content">
          <button className="btn btn-primary Stream-button"
            onClick={() => this.startStreaming()}>
            Start Streaming Data
          </button>
          <div className="Graph">
            {this.state.showGraph && this.renderGraph()}
          </div>
        </div>
      </div>
    )
  }
}

export default App;
