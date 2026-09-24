# schema.rb cannot dump triggers. Re-apply pay-date triggers after every dump
# so `db:schema:load` matches migrate in CI.
module SchemaTriggerDumper
  def trailer(stream)
    sql = Rails.root.join("db/directory_triggers.sql").read
    stream.puts
    stream.puts "  # Cross-table pay dates — kept in db/directory_triggers.sql."
    stream.puts "  execute <<~SQL"
    sql.each_line { |line| stream.puts "    #{line}".rstrip }
    stream.puts "  SQL"
    super
  end
end

ActiveSupport.on_load(:active_record) do
  ActiveRecord::ConnectionAdapters::PostgreSQL::SchemaDumper.prepend(SchemaTriggerDumper)
end
