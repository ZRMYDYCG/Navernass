-- =====================================================
-- 新闻表相关函数
-- =====================================================

-- 创建增加阅读计数的函数
create or replace function increment_news_read_count(news_id uuid)
returns void as $$
begin
  update news
  set read_count = read_count + 1,
      updated_at = timezone('utc'::text, now())
  where id = news_id;
end;
$$ language plpgsql;

-- =====================================================
-- 完成！
-- =====================================================
