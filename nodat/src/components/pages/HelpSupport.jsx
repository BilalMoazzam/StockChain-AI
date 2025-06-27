"use client";

import { useState, useEffect } from "react";
import Header from "../layout/Header";
import FAQSection from "../help/FAQSection";
import SupportCategories from "../help/SupportCategories";
import FeedbackForm from "../help/FeedbackForm";
import UserComments from "../help/UserComments";
import SupportFooter from "../help/SupportFooter";
import { MessageCircle } from "lucide-react";
import "../styles/HelpSupport.css";

const HelpSupport = () => {
  const [loading, setLoading] = useState(true);
  const [showChatSupport, setShowChatSupport] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDemoPopup, setShowDemoPopup] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setShowDemoPopup(true);
  };

  const closeDemoPopup = () => {
    setShowDemoPopup(false);
    setSelectedCategory(null);
  };

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setLoading(false);
    }, 800);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Simulate search functionality
    // In a real app, this would search through FAQs and documentation
    const mockResults = [
      {
        id: 1,
        title: "How to add new inventory items",
        type: "FAQ",
        link: "#inventory-faq",
      },
      {
        id: 2,
        title: "Setting up blockchain verification",
        type: "Documentation",
        link: "#blockchain-docs",
      },
      {
        id: 3,
        title: "Managing user permissions",
        type: "Tutorial",
        link: "#user-tutorial",
      },
    ].filter((item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setSearchResults(mockResults);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
  };

  const toggleChatSupport = () => {
    setShowChatSupport(!showChatSupport);
  };
  const [userComments, setUserComments] = useState([]);
  const handleFeedbackSubmit = (feedbackText) => {
    const newComment = {
      id: userComments.length + 1,
      user: {
        name: "You",
        avatar: "/placeholder.svg?height=50&width=50",
        role: "User",
      },
      date: new Date().toLocaleString(),
      content: feedbackText,
    };
    setUserComments([newComment, ...userComments]); // prepend new comment
  };

  return (
    <div className="help-support">
      <Header
        title="Help & Support"
        breadcrumbs={[
          { text: "Dashboard", active: false },
          { text: "Help & Support", active: true },
        ]}
      />

      <div className="help-support-container">
        {loading ? (
          <div className="loading">Loading help resources...</div>
        ) : (
          <>
            <div className="help-header">
              <div className="help-title-section">
                <h1>Do You Have Questions?</h1>
                <p>We have answers! Find, search, or ask of the team!</p>
                <p className="help-subtitle">
                  We've got 2,500 answers to the most common questions on the
                  StockChain AI Inventory ERP.
                </p>
              </div>

              <div className="help-mascot">
                <p className="mascot-image" />
              </div>

              <div className="search-container">
                {/* <form onSubmit={handleSearch}>
                  <input
                    type="text"
                    placeholder="Search for help topics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button type="submit" className="search-btn">
                    Search
                  </button>
                </form> */}

                {searchResults.length > 0 && (
                  <div className="search-results">
                    <div className="results-header">
                      <h3>Search Results</h3>
                      <button className="clear-search" onClick={clearSearch}>
                        Clear
                      </button>
                    </div>
                    <ul>
                      {searchResults.map((result) => (
                        <li key={result.id}>
                          <a href={result.link}>
                            <span className="result-title">{result.title}</span>
                            <span className="result-type">{result.type}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* <SupportCategories /> */}
            <SupportCategories onCategoryClick={handleCategoryClick} />
            {showDemoPopup && (
              <div className="popup-overlay">
                <div className="popup-box">
                  <button className="close-popup" onClick={closeDemoPopup}>
                    ×
                  </button>
                  <h2>{selectedCategory?.title}</h2>
                  <p>
                    {selectedCategory?.title === "Getting Started" && (
                      <div className="space-y-2 text-gray-700">
                        <p>
                          Here’s how to begin using the platform effectively:
                        </p>
                        <ul className="list-disc list-inside pl-5 space-y-1">
                          <li>
                            Create your first watchlist to track assets in real
                            time.
                          </li>
                          <li>
                            Explore AI-driven insights under the “Insights” tab
                            for smart recommendations.
                          </li>
                          <li>
                            Set up customizable price & volume alerts so you
                            never miss a market move.
                          </li>
                          <li>
                            Personalize your dashboard layout to surface the
                            metrics you care about most.
                          </li>
                        </ul>
                      </div>
                    )}
                    {selectedCategory?.title ===
                      "Frequently Asked Questions" && (
                      <div className="space-y-2 text-gray-700">
                        <p className="font-medium">
                          Find answers to the most common user questions:
                        </p>
                        <ul className="list-disc list-inside pl-5 space-y-1">
                          <li>
                            How do I reset my password or update my email
                            address?
                          </li>
                          <li>
                            What’s the best way to refine my alerts and manage
                            watchlists?
                          </li>
                          <li>
                            Can I change my subscription plan or view billing
                            history?
                          </li>
                          <li>
                            How do I troubleshoot login issues or API connection
                            errors?
                          </li>
                          <li>
                            Where can I find release notes and platform updates?
                          </li>
                        </ul>
                      </div>
                    )}

                    {selectedCategory?.title === "Documentation" && (
                      <div className="space-y-2 text-gray-700">
                        <p className="font-medium">
                          Read our official documentation for developers and
                          users:
                        </p>
                        <ul className="list-disc list-inside pl-5 space-y-1">
                          <li>
                            Comprehensive API reference with endpoint details,
                            parameters, and sample requests.
                          </li>
                          <li>
                            Quickstart guides to help you integrate StockChain
                            AI in under 10 minutes.
                          </li>
                          <li>
                            Step-by-step tutorials on data visualization, custom
                            indicators, and alert setup.
                          </li>
                          <li>
                            SDK examples for JavaScript, Python, and cURL to get
                            you coding right away.
                          </li>
                          <li>
                            Detailed release notes tracking all new features,
                            enhancements, and bug fixes.
                          </li>
                        </ul>
                      </div>
                    )}

                    {selectedCategory?.title === "Knowledge Base" && (
                      <div className="space-y-2 text-gray-700">
                        <p className="font-medium">
                          Browse articles that explain platform features in
                          depth:
                        </p>
                        <ul className="list-disc list-inside pl-5 space-y-1">
                          <li>
                            Deep dives on advanced charting techniques and
                            custom indicator creation.
                          </li>
                          <li>
                            In-depth tutorials on backtesting strategies with
                            historical data.
                          </li>
                          <li>
                            Case studies showcasing how other traders leverage
                            StockChain AI for alpha.
                          </li>
                          <li>
                            Best practices for optimizing alerts, dashboards,
                            and notifications.
                          </li>
                          <li>
                            Troubleshooting guides for common issues like data
                            sync errors and API timeouts.
                          </li>
                          <li>
                            Integration tips for combining StockChain AI with
                            third-party analytics tools.
                          </li>
                        </ul>
                      </div>
                    )}

                    {selectedCategory?.title === "Contact Support" && (
                      <div className="space-y-2 text-gray-700">
                        <p className="font-medium">
                          Reach out to our support team for personalized help:
                        </p>
                        <ul className="list-disc list-inside pl-5 space-y-1">
                          <li>
                            Submit a support ticket via the Help Center—expect a
                            response within 24 hours.
                          </li>
                          <li>
                            Chat live with an agent Monday–Friday, 9 AM–6 PM
                            (your local time).
                          </li>
                          <li>
                            Email us at{" "}
                            <a
                              href="mailto:support@stockchain.ai"
                              className="text-indigo-600 underline"
                            >
                              support@stockchain.ai
                            </a>{" "}
                            anytime.
                          </li>
                          <li>
                            Call our support line at{" "}
                            <a
                              href="tel:+1234567890"
                              className="text-indigo-600 underline"
                            >
                              +1 (234) 567-890
                            </a>{" "}
                            for urgent issues.
                          </li>
                          <li>
                            Track your open tickets and view past conversations
                            in your dashboard.
                          </li>
                        </ul>
                      </div>
                    )}
                  </p>
                </div>
              </div>
            )}
            <FAQSection />
            <div className="feedback-section">
              <FeedbackForm onFeedbackSubmit={handleFeedbackSubmit} />
              <UserComments comments={userComments} />
            </div>
          </>
        )}
      </div>
      <SupportFooter />
    </div>
  );
};

export default HelpSupport;
