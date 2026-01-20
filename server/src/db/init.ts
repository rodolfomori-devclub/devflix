import pool from './pool';
import dotenv from 'dotenv';

dotenv.config();

const initDB = async (): Promise<void> => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Users table (for admin authentication)
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // DevFlix instances table
    await client.query(`
      CREATE TABLE IF NOT EXISTS devflix_instances (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        settings JSONB DEFAULT '{}',
        header_links JSONB DEFAULT '[]',
        initial_banner JSONB DEFAULT '{}',
        countdown_banner JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Classes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS classes (
        id SERIAL PRIMARY KEY,
        instance_id VARCHAR(255) REFERENCES devflix_instances(id) ON DELETE CASCADE,
        class_id VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        video_url TEXT,
        thumbnail_url TEXT,
        duration VARCHAR(50),
        is_available BOOLEAN DEFAULT false,
        scheduled_release TIMESTAMP,
        released_at TIMESTAMP,
        order_index INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(instance_id, class_id)
      )
    `);

    // Materials table
    await client.query(`
      CREATE TABLE IF NOT EXISTS materials (
        id SERIAL PRIMARY KEY,
        instance_id VARCHAR(255) REFERENCES devflix_instances(id) ON DELETE CASCADE,
        class_id VARCHAR(50) NOT NULL,
        item_id VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        url TEXT,
        type VARCHAR(50) DEFAULT 'link',
        locked BOOLEAN DEFAULT true,
        scheduled_unlock TIMESTAMP,
        unlocked_at TIMESTAMP,
        order_index INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(instance_id, class_id, item_id)
      )
    `);

    // Schedule/Cronograma table
    await client.query(`
      CREATE TABLE IF NOT EXISTS schedules (
        id SERIAL PRIMARY KEY,
        instance_id VARCHAR(255) REFERENCES devflix_instances(id) ON DELETE CASCADE,
        day_number INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        date DATE,
        time VARCHAR(50),
        is_active BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Polls table
    await client.query(`
      CREATE TABLE IF NOT EXISTS polls (
        id SERIAL PRIMARY KEY,
        instance_id VARCHAR(255) REFERENCES devflix_instances(id) ON DELETE CASCADE,
        question TEXT NOT NULL,
        options JSONB DEFAULT '[]',
        votes JSONB DEFAULT '{}',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Banners table
    await client.query(`
      CREATE TABLE IF NOT EXISTS banners (
        id SERIAL PRIMARY KEY,
        instance_id VARCHAR(255) REFERENCES devflix_instances(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255),
        content TEXT,
        image_url TEXT,
        link_url TEXT,
        is_visible BOOLEAN DEFAULT false,
        scheduled_activation TIMESTAMP,
        activated_at TIMESTAMP,
        settings JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    await client.query(`CREATE INDEX IF NOT EXISTS idx_classes_instance ON classes(instance_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_materials_instance ON materials(instance_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_materials_class ON materials(instance_id, class_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_schedules_instance ON schedules(instance_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_materials_scheduled ON materials(scheduled_unlock) WHERE scheduled_unlock IS NOT NULL AND locked = true`);

    await client.query('COMMIT');
    console.log('Database initialized successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

initDB();
