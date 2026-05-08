-- ============================================================
-- Seed data for storeonlinebook
-- Run AFTER creating all tables from schema.sql
-- ============================================================

INSERT INTO books (title, author, language, description, price, image_url) VALUES
('The Great Gatsby',      'F. Scott Fitzgerald', 'English', 'A novel about the glittering and corrupt world of the American nouveau riche in 1920s New York.',          10.99, 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&auto=format&fit=crop'),
('1984',                  'George Orwell',        'English', 'A dystopian masterpiece about totalitarian surveillance, propaganda, and the destruction of truth.',        14.50, 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&auto=format&fit=crop'),
('Les Misérables',        'Victor Hugo',          'French',  'An epic French historical novel following the struggles of ex-convict Jean Valjean in post-Napoleonic France.', 12.99, 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&auto=format&fit=crop'),
('Pride and Prejudice',   'Jane Austen',          'English', 'A witty, ironic novel of manners tracing the romantic entanglements of the five Bennet sisters.',           9.99,  'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&auto=format&fit=crop'),
('Don Quixote',           'Miguel de Cervantes',  'Spanish', 'The first modern novel, following the adventures of a delusional knight-errant and his loyal squire.',     11.20, 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&auto=format&fit=crop'),
('The Hobbit',            'J.R.R. Tolkien',       'English', 'A beloved fantasy novel following the unlikely hero Bilbo Baggins on a grand adventure with thirteen dwarves.', 15.00, 'https://images.unsplash.com/photo-1509266272358-7701da638078?w=400&auto=format&fit=crop'),
('To Kill a Mockingbird', 'Harper Lee',           'English', 'A Pulitzer Prize-winning novel about racial injustice and moral growth in the American South.',             13.00, 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=400&auto=format&fit=crop'),
('The Alchemist',         'Paulo Coelho',         'Spanish', 'A philosophical novel about following your dreams and listening to your heart on the journey of life.',     12.50, 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&auto=format&fit=crop'),
('Crime and Punishment',  'Fyodor Dostoevsky',    'French',  'A psychological novel exploring guilt, morality, and redemption through the eyes of a tormented student.',  11.75, 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=400&auto=format&fit=crop'),
('Brave New World',       'Aldous Huxley',        'English', 'A chilling vision of a future society controlled by technology, conditioning, and the pursuit of pleasure.', 13.99, 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&auto=format&fit=crop');
