import React from 'react';

const COMPONENT_CATEGORIES = [
    {
        id: 'basic-elements',
        title: 'Basic Elements',
        items: [
            { type: 'heading', label: 'Heading Text', description: 'Customizable heading tags H1 to H6' },
            { type: 'paragraph', label: 'Paragraph text', description: 'Custom paragraph block for text content' },
            { type: 'button', label: 'Custom Button', description: 'Highly customizable button with border/hover styles' },
            { type: 'image', label: 'Image Element', description: 'Customizable image with height and width' }
        ]
    },
    {
        id: 'banners',
        title: 'Banners & Hero',
        items: [
            { type: 'hero', label: 'Hero Banner', description: 'Large headline with background image & CTA button' },
            { type: 'image-banner', label: 'Image Banner', description: 'Promotional image block with text overlays' },
            { type: 'video-banner', label: 'Video Banner', description: 'Background video section with overlay text' },
            { type: 'carousel', label: 'Carousel Slider', description: 'Auto-rotating image banner slideshow' }
        ]
    },
    {
        id: 'ecommerce',
        title: 'Ecommerce Blocks',
        items: [
            { type: 'featured-products', label: 'Featured Products', description: 'Grid of selected showcase products' },
            { type: 'product-slider', label: 'Product Slider', description: 'Horizontal swipeable product list' },
            { type: 'category-grid', label: 'Category Grid', description: 'Grid of collections with hover effects' },
            { type: 'best-sellers', label: 'Best Sellers', description: 'Dynamic list showing top selling inventory' }
        ]
    },
    {
        id: 'content',
        title: 'Content & Layout',
        items: [
            { type: 'rich-text', label: 'Rich Text Block', description: 'Formatted article content and paragraphs' },
            { type: 'columns', label: 'Columns Block', description: 'Side-by-side content columns (2, 3 or 4)' },
            { type: 'accordion', label: 'Accordion List', description: 'Expandable/collapsible content blocks' },
            { type: 'tabs', label: 'Tabs Layout', description: 'Switchable tabbed content sections' },
            { type: 'spacer', label: 'Spacer', description: 'Custom vertical height gap between elements' },
            { type: 'divider', label: 'Divider Line', description: 'Clean border rule for section splitting' }
        ]
    },
    {
        id: 'marketing',
        title: 'Marketing & Trust',
        items: [
            { type: 'features-grid', label: 'Why Us / Features Grid', description: 'Responsive grid of brand value cards with icons' },
            { type: 'testimonials', label: 'Testimonials', description: 'Carousel of customer reviews and feedback' },
            { type: 'faq', label: 'FAQ Accordion', description: 'Question and answer collapsible list' },
            { type: 'countdown', label: 'Countdown Timer', description: 'Ticking clock for flash sales or events' },
            { type: 'newsletter', label: 'Newsletter Signup', description: 'Email subscription form section' }
        ]
    },
    {
        id: 'interactive',
        title: 'Interactive',
        items: [
            { type: 'contact-form', label: 'Contact Form', description: 'Interactive visitor inquiry message form' },
            { type: 'social-icons', label: 'Social Media Feed', description: 'Follow icons for Instagram, Facebook, etc' },
            { type: 'pricing-table', label: 'Pricing Table', description: 'Compare features and billing plans' },
            { type: 'lookbook', label: 'Shoppable Lookbook', description: 'Lifestyle image with clickable product hotspots' },
            { type: 'shoppable-video', label: 'Shoppable Video', description: 'Campaign video with attached product links' },
            { type: 'before-after', label: 'Before / After', description: 'Interactive image comparison slider' },
            { type: 'storytelling', label: 'Brand Story', description: 'Sticky scroll chapters for brand storytelling' }
        ]
    }
];

export default function ComponentLibrary({ onAddComponent }) {
    return (
        <div className="flex flex-col h-full bg-white border-r border-zinc-200">
            <div className="p-4 border-b border-zinc-150">
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Add Element</h3>
                <p className="text-[10px] text-zinc-500 font-semibold mt-1">Select a component template to add to your page layout</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-6 storefront-scrollbar">
                {COMPONENT_CATEGORIES.map(category => (
                    <div key={category.id} className="space-y-2.5">
                        <span className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b pb-1 border-zinc-100">
                            {category.title}
                        </span>
                        
                        <div className="grid grid-cols-1 gap-2">
                            {category.items.map(item => (
                                <button
                                    key={item.type}
                                    onClick={() => onAddComponent(item.type, item.label)}
                                    className="flex items-start text-left p-3 rounded-xl border border-zinc-150 hover:border-[#008060] hover:bg-emerald-50/20 hover:shadow-sm transition-all group cursor-pointer"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-xs font-black text-zinc-800 group-hover:text-[#008060] transition-colors">
                                                {item.label}
                                            </span>
                                            <span className="text-[9px] bg-zinc-100 group-hover:bg-emerald-100 group-hover:text-emerald-700 px-1.5 py-0.5 rounded text-zinc-500 font-black">
                                                + ADD
                                            </span>
                                        </div>
                                        <p className="text-[9px] text-zinc-450 font-semibold mt-0.5 leading-relaxed">
                                            {item.description}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
