import fs from 'fs';

const p = 'd:/Github/Shopify_Clone/admin-frontend/src/modules/user/components/storefront/StorefrontLayout.jsx';
let s = fs.readFileSync(p, 'utf8');

s = s.replace(
  "fontFamily: storeInfo?.themeSettings?.fontFamily || 'Inter, sans-serif'",
  "'--heading-font': storeInfo?.themeSettings?.headingFont || storeInfo?.themeSettings?.fontFamily || 'Inter, sans-serif',\n                    fontFamily: storeInfo?.themeSettings?.fontFamily || 'Inter, sans-serif'"
);

const start = s.indexOf('                        {/* Header */}');
const endMarker = '                </header>';
const end = s.indexOf(endMarker);
if (start === -1 || end === -1) {
  console.error('markers not found', start, end);
  process.exit(1);
}

const replacement = `                        <ThemeHeader
                            storeInfo={storeInfo}
                            cartCount={cartCount}
                            customer={customer}
                            pages={pages}
                            isScrolled={isScrolled}
                            isMobileMenuOpen={isMobileMenuOpen}
                            setIsMobileMenuOpen={setIsMobileMenuOpen}
                            showSearchOverlay={showSearchOverlay}
                            setShowSearchOverlay={setShowSearchOverlay}
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            handleSearchSubmit={handleSearchSubmit}
                            onLogout={onLogout}
                            getLink={getLink}
                        />`;

s = s.slice(0, start) + replacement + s.slice(end + endMarker.length);
fs.writeFileSync(p, s);
console.log('OK — header swapped');
