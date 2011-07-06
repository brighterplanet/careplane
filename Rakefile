require './lib/careplane_config'
require 'fileutils'
require 'rake/clean'
require 'erb'

require 'cucumber'
require 'cucumber/rake/task'

require 'jasmine/base'
require 'jasmine/config'
require 'jasmine/server'

Cucumber::Rake::Task.new

def psh(cmd, cwd = '.')
  Dir.chdir(cwd) do
    sh cmd
  end
end

BROWSERS = %w{chrome firefox safari}

def datetime
  Time.now.strftime('%Y-%m-%d')
end

def versions
  @versions ||= `git tag -l v*`.split("\n").map { |v| Gem::Version.new(v.sub('v','')) }.sort
end

def current_version
  versions.last.to_s
end
def last_version
  versions[versions.length - 2].to_s
end

def version
  File.read('VERSION').gsub(/[\s\n]+$/,'')
end

def changelog_post(browser)
  "pages/_posts/#{datetime}-careplane-#{browser}-#{current_version}.markdown"
end

@files = {
  :chrome_package => 'google_chrome/build/careplane.zip',
  :chrome_download => lambda { "pages/downloads/careplane-#{current_version}.zip" },
  :firefox_package => 'firefox/build/careplane.xpi',
  :firefox_download => lambda { "pages/downloads/careplane-#{current_version}.xpi" },
  :firefox4_package => 'firefox/build/careplane-ff4.xpi',
  :firefox4_download => lambda { "pages/downloads/careplane-#{current_version}-ff4.xpi" },
  :safari_package => 'safari/build/careplane.safariextz',
  :safari_download => lambda { "pages/downloads/careplane-#{current_version}.safariextz" }
}

desc 'Update changelog (make sure you have run `rake version:bump` first)'
task :changelog, :message do |t, args|
  unless File.exist?('pages')
    puts "Run `rake pages` first"
    exit
  end

  message = args[:message]
  unless message
    commits = `git log --pretty=oneline v#{last_version}..v#{current_version}`
    prelude = <<-TXT
v#{current_version} #{datetime}
  Enter the list of changes for version 
  Here's a commit list to help jog your memory
#{commits.split("\n").map { |c| "  #{c}" }.join("\n")}
    TXT
    tempfile = '/tmp/careplane-changelog-entry.txt'
    FileUtils.rm_f tempfile
    File.open(tempfile, 'w') { |f| f.puts prelude }
    editor = ENV['GIT_EDITOR'] || ENV['VISUAL'] || ENV['EDITOR'] || 'vi'
    Process.fork do
      exec "#{editor} #{tempfile}"
    end
    Process.wait
    message = File.read(tempfile)
    FileUtils.rm_f tempfile
  end

  BROWSERS.each do |browser|
    File.open(changelog_post(browser), 'w') do |f|
      f.puts <<-TXT
---
version: #{current_version}
categories: #{browser}
filename: #{File.basename(@files["#{browser}_download".to_sym].call)}
filesize: #{File.size(@files["#{browser}_package".to_sym]) / 1000}
---
#{message}
      TXT
    end
    puts "Wrote Changelog entry for v#{current_version} to #{changelog_post(browser)}"
  end

  existing_changelog = File.read 'CHANGELOG'
  unless existing_changelog =~ /v#{current_version}/
    File.open 'CHANGELOG', 'w' do |f|
      f.puts message
      f.puts existing_changelog
    end
    puts 'Wrote CHANGELOG'
  end
end


task :version do
  puts version
end
namespace :version do

  task :bump => 'version:bump:patch'

  namespace :bump do
    task :patch do
      current = version
      whole, major, minor, patch = current.match(/(\d+)\.(\d+)\.(\d+)$/).to_a
      patch = patch.to_i + 1
      task('version:set').invoke("#{major}.#{minor}.#{patch}")
    end
    task :minor do
      current = version
      whole, major, minor = current.match(/(\d+)\.(\d+)\.\d+$/).to_a
      minor = minor.to_i + 1
      task('version:set').invoke("#{major}.#{minor}.0")
    end
    task :major do
      current = version
      whole, major = current.match(/(\d+)\.\d+\.\d+$/).to_a
      major = (major.to_i + 1)
      task('version:set').invoke("#{major}.0.0")
    end
  end

  task :set, :string do |t, args|
    File.open('VERSION', 'w') { |f| f.puts args[:string] }

    Rake::Task['build'].invoke
    psh 'git add VERSION firefox4/install.rdf firefox/package.json google_chrome/manifest.json safari/careplane.safariextension/Info.plist'
    psh "git commit -m 'Version bump to #{args[:string]}'"

    puts "Version set to #{args[:string]}"
  end

  task :tag do
    psh "git tag v#{version}"
    puts "Tagged #{`git log -n 1 --pretty=oneline`} with v#{version}"
  end
end


directory 'pages/'
task :pages => 'pages:sync'
# Update the pages/ directory clone
namespace :pages do
  desc 'Initialize the pages directory to allow versioning'
  task :sync => ['.git/refs/heads/gh-pages', 'pages/.git/refs/remotes/o'] do |f|
    psh 'git fetch -q o', 'pages'
    psh 'git reset -q --hard o/gh-pages', 'pages'
    psh 'touch pages'
  end

  file '.git/refs/heads/gh-pages' => 'pages/' do |f|
    unless File.exist? f.name
      psh 'git branch gh-pages'
    end
  end

  file 'pages/.git/refs/remotes/o' => 'pages/' do |f|
    unless File.exist? f.name
      psh 'git init -q pages'
      psh 'git remote add o ../.git', 'pages'
    end
  end
end

CLOBBER.include 'pages/.git'

@css_files = ['stylesheets/careplane.css']
@image_files = ['images/icon64.png']

def build(driver, target_dir = '')
  puts 'Copying files...'
  (CareplaneConfig.content_script_files(driver) + @css_files + @image_files).each do |file|
    destination = File.join(driver, target_dir, file)
    FileUtils.mkdir_p(File.dirname(destination))
    puts file
    FileUtils.cp file, destination
  end
end

def templates(target)
  @version = version
  Dir.glob(File.join('rake', 'templates', target, '**/*.erb')).each do |template|
    erb = ERB.new File.read(template)
    filename = File.basename template, '.erb'
    target_dir = File.dirname(template).sub!(/^rake\/templates\//,'')
    File.open(File.join(target_dir, filename), 'w') { |f| f.puts erb.result(binding) }
  end
end

directory 'firefox4/build'
namespace :firefox4 do
  desc 'Build Firefox 4.x extension'
  task :build => 'firefox4:build:templates' do
    puts 'Building Firefox 4.x'
    build 'firefox4', 'chrome/content'
    puts 'Done'
  end
  namespace :build do
    task :templates do
      puts 'Building Firefox 4.x templates'
      templates 'firefox4'
      puts 'Done'
    end
  end
  desc "Package Firefox 4.x extension into #{@files[:firefox4_package]} file"
  task :package => [:build, 'firefox4/build'] do
    Dir.chdir 'firefox4' do
      puts `zip -r build/careplane.xpi chrome defaults chrome.manifest icon.png install.rdf -x *~`
    end
  end
end

directory 'firefox/build'
namespace :firefox do
  desc 'Build Firefox extension'
  task :build => 'firefox:build:templates' do
    puts 'Building Firefox'

    puts 'Copying files...'
    (@css_files + @image_files).each do |asset|
      destination = File.join('firefox', 'data', File.basename(asset))
      FileUtils.cp asset, destination
    end
    CareplaneConfig.content_script_files('firefox').each do |file|
      destination = File.join 'firefox', 'data', file.sub(/^src\//, '')
      FileUtils.mkdir_p(File.dirname(destination))
      puts file
      FileUtils.cp file, destination
    end
    CareplaneConfig.worker_files.each do |file|
      destination = File.join 'firefox', 'lib', file.sub(/^src\//, '')
      FileUtils.mkdir_p(File.dirname(destination))
      puts file
      FileUtils.cp file, destination
    end
    puts 'Done'
  end
  namespace :build do
    task :templates do
      puts 'Building Firefox templates'
      templates 'firefox'
      puts 'Done'
    end
  end
  desc "Package Firefox extension into #{@files[:firefox_package]} file"
  task :package => [:build, 'firefox/build'] do
    Dir.chdir 'firefox' do
      puts `../moz-addon-sdk/bin/cfx xpi`
      FileUtils.mv 'careplane.xpi', 'build/careplane.xpi'
    end
  end

  task :develop => 'firefox:build' do
    Dir.chdir 'firefox' do
      puts `../moz-addon-sdk/bin/cfx run --addons=../moz-addon-sdk/firebug-1.7.3.xpi`
    end
  end
end

namespace :google_chrome do
  task :build => 'google_chrome:build:templates' do
    puts 'Building Google Chrome'

    puts 'Copying assets...'
    (@css_files + @image_files).each do |file|
      destination = File.join('google_chrome', file)
      FileUtils.mkdir_p File.dirname(destination)
      puts "#{file} > #{destination}"
      FileUtils.cp file, destination
    end

    CareplaneConfig.worker_files.each do |file|
      destination = File.join('google_chrome', file.sub(/^src\//,''))
      FileUtils.mkdir_p File.dirname(destination)
      puts "#{file} > #{destination}"
      FileUtils.cp file, destination
    end
    puts 'Done'
  end
  namespace :build do
    task :templates do
      puts 'Building Google Chrome templates'
      templates 'google_chrome'
      puts 'Done'
    end
  end

  task :package => :build do
    FileUtils.mkdir_p('google_chrome/build')
    Dir.chdir 'google_chrome' do
      puts `zip -r build/careplane.zip application.js CareplaneTrackerService.js background.html images manifest.json options.html stylesheets -x *~`
    end
  end
end

namespace :safari do
  directory 'safari/build'

  desc 'Build Safari extension'
  task :build => ['safari/build', 'safari:build:templates'] do
    puts 'Building Safari'
    build 'safari', 'careplane.safariextension'
    FileUtils.cp 'src/CareplaneTrackerService.js', 'safari/careplane.safariextension/CareplaneTrackerService.js'
    puts 'Done'
  end
  namespace :build do
    task :templates do
      puts 'Building Safari templates'
      templates 'safari/careplane.safariextension'
      puts 'Done'
    end
  end

  desc "Package Safari extension into #{@files[:safari_package]} file"
  task :package => :build do
    FileUtils.mkdir_p('safari/build')
    Dir.chdir 'safari' do
      puts `zip -r build/careplane.safariextz careplane.safariextension -x *~`
    end
  end
end

desc 'Run Jasmine unit tests (requires Node.js)'
task :examples, :spec do |t, args|
  ENV['NODE_PATH'] = 'src'

  if args[:spec]
    exec "node spec/javascripts/support/jasmine-node.js #{args[:spec]}"
  else
    exec 'node spec/javascripts/support/jasmine-node.js'
  end
end

desc 'Check the syntax of all Careplane source files (requires Node.js)'
task :syntax, :file do |t, args|
  if args[:file]
    exec "`npm bin`/jshint #{args[:file]}"
  else
    files = CareplaneConfig.all_js_files.reject { |f| f =~ /jquery-.*\.js/ }
    files.each do |file|
      print file + '...' 
      puts `\`npm bin\`/jshint #{file}`
    end
  end
end

namespace :jasmine do
  desc 'Build Jasmine spec setup'
  task :build do
    puts 'Building Jasmine templates'
    templates 'spec'
    puts 'Done'
  end

  desc 'Run Jasmine spec server'
  task :server do
    jasmine_config_overrides = 'spec/javascripts/support/jasmine_config.rb'
    require jasmine_config_overrides if File.exist?(jasmine_config_overrides)

    puts "your tests are here:"
    puts "  http://localhost:8888/"

    Jasmine::Config.new.start_server
  end
end

desc 'Build all plugins and Jasmine'
task :build => ['firefox:build', 'google_chrome:build', 'safari:build', 'jasmine:build']

desc 'Package all plugins'
task :package => ['firefox:package', 'google_chrome:package', 'safari:package']


BROWSERS.each do |browser|
  file changelog_post(browser) => :changelog
end
directory 'pages/downloads'

desc 'Build all packages and copy them to gh-pages'
task :publish_packages => (BROWSERS.map { |b| changelog_post(b) } + [:package, 'pages/downloads']) do
  %w{chrome firefox safari}.each do |browser|
    FileUtils.cp @files["#{browser}_package".to_sym], @files["#{browser}_download".to_sym].call
  end
end

namespace :site do
  task :commit => 'pages/' do
    psh 'git add _posts downloads', 'pages'
    psh "git commit -m 'Release for version #{current_version}'", 'pages' do |ok,res|
      verbose { puts "gh-pages updated" }
      Rake::Task['site:push'].invoke
    end
  end

  task :push do
    psh 'git push -q o HEAD:gh-pages', 'pages' unless ENV['NO_PUSH']
    puts 'Pushed gh-pages to HEAD'
  end
end

task :push do
  psh 'git push origin'
end

desc 'Build packages, copy them to gh-pages, update website links, push'
task :release => [:publish_packages, 'site:commit', :push]

task :test => [:examples, :features]
task :default => :test
